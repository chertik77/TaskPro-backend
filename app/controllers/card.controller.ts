import type { TypedRequest, TypedRequestParams } from '@/types'
import type { NextFunction, Response } from 'express'

import { BadRequest, NotFound } from 'http-errors'

import { prisma } from '@/config/prisma'

import {
  AddCardSchema,
  CardParamsSchema,
  ColumnParamsSchema,
  EditCardSchema,
  UpdateOrderSchema
} from '@/schemas'

class CardController {
  async add(
    {
      params,
      body
    }: TypedRequest<typeof AddCardSchema, typeof ColumnParamsSchema>,
    res: Response,
    next: NextFunction
  ) {
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

  async updateById(
    {
      params,
      body
    }: TypedRequest<typeof EditCardSchema, typeof CardParamsSchema>,
    res: Response,
    next: NextFunction
  ) {
    const updatedCard = await prisma.card.updateIgnoreNotFound({
      where: { id: params.cardId },
      data: body
    })

    if (!updatedCard) return next(NotFound('Card not found'))

    res.json(updatedCard)
  }

  async updateOrder(
    {
      params,
      body
    }: TypedRequest<typeof UpdateOrderSchema, typeof ColumnParamsSchema>,
    res: Response,
    next: NextFunction
  ) {
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

  async deleteById(
    { params }: TypedRequestParams<typeof CardParamsSchema>,
    res: Response,
    next: NextFunction
  ) {
    const deletedCard = await prisma.card.deleteIgnoreNotFound({
      where: { id: params.cardId }
    })

    if (!deletedCard) return next(NotFound('Card not found'))

    res.status(204).send()
  }
}

export const cardController = new CardController()
