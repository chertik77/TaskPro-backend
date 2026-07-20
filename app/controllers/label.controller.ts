import type {
  CreateLabelSchema,
  LabelParamsSchema,
  UpdateLabelSchema
} from '@/schemas'
import type {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams
} from '@/types'
import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'

import { prisma } from '@/prisma'
import { invalidate, redisKeys } from '@/redis'
import { Conflict, NotFound } from 'http-errors'

import { redisClient } from '@/config'

class LabelController {
  getAll = async ({ user }: Request, res: Response) => {
    const cacheKey = redisKeys.labels.byUser(user.id)

    const cachedLabels = await redisClient.get(cacheKey)

    if (cachedLabels) {
      res.json(JSON.parse(cachedLabels))
    } else {
      const labels = await prisma.label.findMany({ where: { userId: user.id } })

      await redisClient.set(cacheKey, JSON.stringify(labels), 'EX', 5 * 60)

      res.json(labels)
    }
  }

  createLabel = async (
    { body, user }: TypedRequestBody<typeof CreateLabelSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, color } = body

    const labelWithSameName = await prisma.label.findUnique({
      where: { userId_name: { userId: user.id, name } }
    })

    if (labelWithSameName) {
      return next(Conflict('Label with same name already exists'))
    }

    const label = await prisma.label.create({
      data: { name, color, userId: user.id }
    })

    await invalidate.labels(user.id)

    res.json(label)
  }

  updateById = async (
    {
      params,
      body,
      user
    }: TypedRequest<
      typeof LabelParamsSchema,
      ZodType,
      typeof UpdateLabelSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    const updatedLabel = await prisma.label.updateIgnoreNotFound({
      where: { id: params.labelId, userId: user.id },
      data: body
    })

    if (!updatedLabel) return next(NotFound('Label not found'))

    const affectedBoards = await this.findAffectedBoardsByLabelId(
      user.id,
      updatedLabel.id
    )

    await Promise.all([
      invalidate.labels(user.id),
      invalidate.boardMany(
        user.id,
        affectedBoards.map(board => board.id)
      )
    ])

    res.json(updatedLabel)
  }

  deleteById = async (
    { params, user }: TypedRequestParams<typeof LabelParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const label = await prisma.label.findFirst({
      where: { id: params.labelId, userId: user.id }
    })

    if (!label) return next(NotFound('Label not found'))

    const tasks = await prisma.task.findMany({
      where: { labelIds: { has: label.id } },
      select: { id: true, labelIds: true }
    })

    const affectedBoards = await this.findAffectedBoardsByLabelId(
      user.id,
      label.id
    )

    await prisma.$transaction([
      ...tasks.map(task =>
        prisma.task.update({
          where: { id: task.id },
          data: {
            labelIds: {
              set: task.labelIds.filter(id => id !== label.id)
            }
          }
        })
      ),
      prisma.label.delete({ where: { id: label.id } })
    ])

    await Promise.all([
      invalidate.labels(user.id),
      invalidate.boardMany(
        user.id,
        affectedBoards.map(board => board.id)
      )
    ])

    res.sendStatus(204)
  }

  findAffectedBoardsByLabelId = async (userId: string, labelId: string) => {
    return await prisma.board.findMany({
      where: {
        userId,
        columns: {
          some: {
            tasks: { some: { labels: { some: { id: labelId } } } }
          }
        }
      },
      select: { id: true }
    })
  }
}

export const labelController = new LabelController()
