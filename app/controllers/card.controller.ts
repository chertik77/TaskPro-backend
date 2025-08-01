import type {
  AddCardSchema,
  CardParamsSchema,
  ColumnParamsSchema,
  EditCardSchema,
  UpdateCardOrderSchema
} from '@/schemas'
import type { TypedRequest, TypedRequestParams } from '@/types'
import type { NextFunction, Response } from 'express'
import type { ZodType } from 'zod'

import { prisma } from '@/prisma'
import { BadRequest, NotFound } from 'http-errors'

import { redisClient } from '@/config'

class CardController {
  add = async (
    {
      params,
      body
    }: TypedRequest<typeof ColumnParamsSchema, ZodType, typeof AddCardSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const column = await prisma.column.findFirst({
      where: { id: params.columnId },
      include: { board: { select: { userId: true } } }
    })

    if (!column) return next(NotFound('Column not found'))

    const newOrder = await this.getNewCardOrder(column.id)

    const newCard = await prisma.card.create({
      data: { ...body, columnId: column.id, order: newOrder }
    })

    await redisClient.del(`board:${column.boardId}:user:${column.board.userId}`)

    res.json(newCard)
  }

  updateById = async (
    {
      params,
      body
    }: TypedRequest<typeof CardParamsSchema, ZodType, typeof EditCardSchema>,
    res: Response,
    next: NextFunction
  ) => {
    if (body.columnId) {
      const column = await prisma.column.findFirst({
        where: { id: body.columnId }
      })

      if (!column) return next(NotFound('Column not found'))
    }

    const updatedCard = await prisma.card.updateIgnoreNotFound({
      where: { id: params.cardId },
      data: body,
      include: { column: { include: { board: { select: { userId: true } } } } }
    })

    if (!updatedCard) return next(NotFound('Card not found'))

    const { column, ...card } = updatedCard

    await redisClient.del(`board:${column.boardId}:user:${column.board.userId}`)

    res.json(card)
  }

  updateOrder = async (
    {
      params,
      body
    }: TypedRequest<
      typeof ColumnParamsSchema,
      ZodType,
      typeof UpdateCardOrderSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    const column = await prisma.column.findFirst({
      where: { id: params.columnId },
      include: { board: { select: { userId: true } } }
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

      await redisClient.del(
        `board:${column.boardId}:user:${column.board.userId}`
      )

      res.json(updatedCards)
    } catch {
      return next(BadRequest('Invalid order'))
    }
  }

  deleteById = async (
    { params }: TypedRequestParams<typeof CardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const deletedCard = await prisma.card.deleteIgnoreNotFound({
      where: { id: params.cardId },
      include: { column: { include: { board: { select: { userId: true } } } } }
    })

    if (!deletedCard) return next(NotFound('Card not found'))

    await redisClient.del(
      `board:${deletedCard.column.boardId}:user:${deletedCard.column.board.userId}`
    )

    res.sendStatus(204)
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
