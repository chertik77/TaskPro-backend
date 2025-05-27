import type {
  AddCardSchema,
  CardParamsSchema,
  ColumnParamsSchema,
  EditCardSchema,
  MoveCardSchema,
  UpdateOrderSchema
} from '@/schemas'
import type { TypedRequest, TypedRequestParams } from '@/types'
import type { NextFunction, Response } from 'express'

import { prisma } from '@/prisma'
import { BadRequest, NotFound } from 'http-errors'

class CardController {
  add = async (
    {
      params,
      body
    }: TypedRequest<typeof AddCardSchema, typeof ColumnParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const column = await prisma.column.findFirst({
      where: { id: params.columnId }
    })

    if (!column) return next(NotFound('Column not found'))

    const newOrder = await this.getNewCardOrder(column.id)

    const newCard = await prisma.card.create({
      data: { ...body, columnId: column.id, order: newOrder }
    })

    res.json(newCard)
  }

  updateById = async (
    {
      params,
      body
    }: TypedRequest<typeof EditCardSchema, typeof CardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const updatedCard = await prisma.card.updateIgnoreNotFound({
      where: { id: params.cardId },
      data: body
    })

    if (!updatedCard) return next(NotFound('Card not found'))

    res.json(updatedCard)
  }

  updateOrder = async (
    {
      params,
      body
    }: TypedRequest<typeof UpdateOrderSchema, typeof ColumnParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
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

  move = async (
    { params }: TypedRequestParams<typeof MoveCardSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const column = await prisma.column.findFirst({
      where: { id: params.newColumnId }
    })

    if (!column) return next(NotFound('Column not found'))

    const newOrder = await this.getNewCardOrder(column.id)

    const updatedCard = await prisma.card.updateIgnoreNotFound({
      where: { id: params.cardId },
      data: { columnId: column.id, order: newOrder }
    })

    if (!updatedCard) return next(NotFound('Card not found'))

    res.json(updatedCard)
  }

  deleteById = async (
    { params }: TypedRequestParams<typeof CardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const deletedCard = await prisma.card.deleteIgnoreNotFound({
      where: { id: params.cardId }
    })

    if (!deletedCard) return next(NotFound('Card not found'))

    res.status(204).send()
  }

  private getNewCardOrder = async (columnId: string) => {
    const lastCard = await prisma.card.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = lastCard ? lastCard.order + 1 : 1

    return newOrder
  }
}

export const cardController = new CardController()
