import type { CreateLabelSchema, UpdateLabelSchema } from '@/schemas'
import type { z } from '@hono/zod-openapi'

import { HTTPException } from 'hono/http-exception'

import { isUniqueConstraintError, prisma } from '@/prisma'
import { cached, invalidate, REDIS_TTL, redisKeys } from '@/redis'

const rethrowNameConflict = (err: unknown): never => {
  if (isUniqueConstraintError(err)) {
    throw new HTTPException(409, {
      message: 'Label with same name already exists'
    })
  }

  throw err
}

class LabelService {
  getAll = (userId: string) =>
    cached(redisKeys.labels.byUser(userId), REDIS_TTL.DEFAULT, () =>
      prisma.label.findMany({ where: { userId } })
    )

  create = async (data: z.infer<typeof CreateLabelSchema>, userId: string) => {
    const { name, color } = data

    const label = await prisma.label
      .create({ data: { name, color, userId } })
      .catch(rethrowNameConflict)

    await invalidate.labels(userId)

    return label
  }

  updateById = async (
    data: z.infer<typeof UpdateLabelSchema>,
    labelId: string,
    userId: string
  ) => {
    const updatedLabel = await prisma.label
      .updateIgnoreNotFound({ where: { id: labelId, userId }, data })
      .catch(rethrowNameConflict)

    if (!updatedLabel) {
      throw new HTTPException(404, { message: 'Label not found' })
    }

    const affectedBoards = await this.findAffectedBoardsByLabelId(
      userId,
      updatedLabel.id
    )

    await Promise.all([
      invalidate.labels(userId),
      invalidate.boardMany(
        userId,
        affectedBoards.map(board => board.id)
      )
    ])

    return updatedLabel
  }

  deleteById = async (labelId: string, userId: string) => {
    const label = await prisma.label.findFirst({
      where: { id: labelId, userId }
    })

    if (!label) {
      throw new HTTPException(404, { message: 'Label not found' })
    }

    const tasks = await prisma.task.findMany({
      where: { labelIds: { has: label.id } },
      select: { id: true, labelIds: true }
    })

    const affectedBoards = await this.findAffectedBoardsByLabelId(
      userId,
      label.id
    )

    await prisma.$transaction([
      ...tasks.map(task =>
        prisma.task.update({
          where: { id: task.id },
          data: {
            labelIds: { set: task.labelIds.filter(id => id !== label.id) }
          }
        })
      ),
      prisma.label.delete({ where: { id: label.id } })
    ])

    await Promise.all([
      invalidate.labels(userId),
      invalidate.boardMany(
        userId,
        affectedBoards.map(board => board.id)
      )
    ])
  }

  private findAffectedBoardsByLabelId = async (
    userId: string,
    labelId: string
  ) => {
    return await prisma.board.findMany({
      where: {
        userId,
        columns: {
          some: { tasks: { some: { labels: { some: { id: labelId } } } } }
        }
      },
      select: { id: true }
    })
  }
}

export const labelService = new LabelService()
