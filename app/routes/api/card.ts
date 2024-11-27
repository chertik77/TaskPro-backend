import { Router } from 'express'
import { prisma } from 'app'
import createHttpError from 'http-errors'
import {
  validateRequestBody,
  validateRequestParams
} from 'zod-express-middleware'

import { authenticate } from 'middlewares'

import { UpdateOrderSchema } from 'schemas/board'
import { AddCardSchema, CardParamsSchema, EditCardSchema } from 'schemas/card'
import { ColumnParamsSchema } from 'schemas/column'

export const cardRouter = Router()

cardRouter.use(authenticate)

cardRouter.post(
  '/:columnId',
  validateRequestParams(ColumnParamsSchema),
  validateRequestBody(AddCardSchema),
  async ({ params, body }, res, next) => {
    const isCurrentColumn = await prisma.column.findFirst({
      where: { id: params.columnId }
    })

    if (!isCurrentColumn) {
      return next(createHttpError(404, 'Column not found'))
    }

    const lastCard = await prisma.card.findFirst({
      where: { columnId: params.columnId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = lastCard ? lastCard.order + 1 : 1

    const newCard = await prisma.card.create({
      data: { ...body, order: newOrder, columnId: params.columnId }
    })

    res.status(201).json(newCard)
  }
)

cardRouter.put(
  '/:cardId',
  validateRequestParams(CardParamsSchema),
  validateRequestBody(EditCardSchema),
  async ({ params, body }, res, next) => {
    const updatedCard = await prisma.card.update({
      where: { id: params.cardId },
      data: body
    })

    if (!updatedCard) {
      return next(createHttpError(404, 'Card not found'))
    }

    res.json(updatedCard)
  }
)

cardRouter.patch(
  '/:columnId/order',
  validateRequestParams(ColumnParamsSchema),
  validateRequestBody(UpdateOrderSchema),
  async ({ params, body }, res, next) => {
    const column = await prisma.column.findFirst({
      where: { id: params.columnId }
    })

    if (!column) {
      return next(createHttpError(404, 'Column not found'))
    }

    const transaction = body.ids.map((id, order) =>
      prisma.card.update({
        where: { id },
        data: { order, columnId: params.columnId }
      })
    )

    try {
      const updatedCards = await prisma.$transaction(transaction)
      res.json(updatedCards)
    } catch {
      return next(createHttpError(400, 'Invalid order'))
    }
  }
)

cardRouter.delete(
  '/:cardId',
  validateRequestParams(CardParamsSchema),
  async ({ params }, res, next) => {
    const deletedCard = await prisma.card.delete({
      where: { id: params.cardId }
    })

    if (!deletedCard) {
      return next(createHttpError(404, 'Card not found'))
    }

    res.status(204).send()
  }
)
