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
import { NotFound } from 'http-errors'

import { redisClient } from '@/config'

class LabelController {
  getAll = async ({ user }: Request, res: Response) => {
    const cacheKey = `labels:user:${user.id}`

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
    res: Response
  ) => {
    const { name, color } = body

    const label = await prisma.label.create({
      data: { name, color, userId: user.id }
    })

    await redisClient.del(`labels:user:${user.id}`)

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

    await redisClient.del(`labels:user:${user.id}`)

    res.json(updatedLabel)
  }

  deleteById = async (
    { params, user }: TypedRequestParams<typeof LabelParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const deletedLabel = await prisma.label.deleteIgnoreNotFound({
      where: { id: params.labelId, userId: user.id }
    })

    if (!deletedLabel) return next(NotFound('Label not found'))

    await redisClient.del(`labels:user:${user.id}`)

    res.sendStatus(204)
  }
}

export const labelController = new LabelController()
