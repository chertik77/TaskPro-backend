import { Router } from 'express'
import { BadRequest, NotFound } from 'http-errors'
import { prisma } from 'prisma/prisma.client'

import { authenticate, validateRequest } from 'middlewares'

import { UpdateOrderSchema } from 'schemas/board'
import { AddCardSchema, CardParamsSchema, EditCardSchema } from 'schemas/card'
import { ColumnParamsSchema } from 'schemas/column'

export const cardRouter = Router()

cardRouter.use(authenticate)

cardRouter.post(
  '/:columnId',
  validateRequest({ body: AddCardSchema, params: ColumnParamsSchema }),
  async ({ params, body }, res, next) => {
    const column = await prisma.column.findFirst({
      where: { id: params.columnId }
    })

    if (!column) return next(NotFound('Column not found'))

    const lastCard = await prisma.card.findFirst({
      where: { columnId: column.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = lastCard ? lastCard.order + 1 : 1

    const newCard = await prisma.card.create({
      data: { ...body, order: newOrder, columnId: column.id }
    })

    res.json(newCard)
  }
)

cardRouter.put(
  '/:cardId',
  validateRequest({ body: EditCardSchema, params: CardParamsSchema }),
  async ({ params, body }, res, next) => {
    const updatedCard = await prisma.card.updateIgnoreNotFound({
      where: { id: params.cardId },
      data: body
    })

    if (!updatedCard) return next(NotFound('Card not found'))

    res.json(updatedCard)
  }
)

cardRouter.patch(
  '/:columnId/order',
  validateRequest({ body: UpdateOrderSchema, params: ColumnParamsSchema }),
  async ({ params, body }, res, next) => {
    const column = await prisma.column.findFirst({
      where: { id: params.columnId }
    })

    if (!column) return next(NotFound('Column not found'))

    const transaction = body.ids.map((id, order) =>
      prisma.card.update({
        where: { id },
        data: { order, columnId: column.id }
      })
    )

    try {
      const updatedCards = await prisma.$transaction(transaction)
      res.json(updatedCards)
    } catch {
      return next(BadRequest('Invalid order'))
    }
  }
)

cardRouter.delete(
  '/:cardId',
  validateRequest({ params: CardParamsSchema }),
  async ({ params }, res, next) => {
    const deletedCard = await prisma.card.deleteIgnoreNotFound({
      where: { id: params.cardId }
    })

    if (!deletedCard) return next(NotFound('Card not found'))

    res.status(204).send()
  }
)
