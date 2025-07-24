import type {
  AddCardSchema,
  CardParamsSchema,
  ColumnParamsSchema,
  EditCardSchema,
  MoveCardSchema,
  UpdateCardOrderSchema
} from '@/schemas'
import type { NextFunction, Response } from 'express'
import type { ZodType } from 'zod'
import type { TypedRequest, TypedRequestParams } from 'zod-express-middleware'

import { prisma } from '@/prisma'
import { BadRequest, NotFound } from 'http-errors'

import { redis } from '@/config'

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
      select: { id: true, boardId: true, board: { select: { userId: true } } }
    })

    if (!column) return next(NotFound('Column not found'))

    const newOrder = await this.getNewCardOrder(column.id)

    const newCard = await prisma.card.create({
      data: { ...body, columnId: column.id, order: newOrder }
    })

    await redis.del(`board:${column.boardId}:user:${column.board.userId}`)

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
    const updatedCard = await prisma.card.updateIgnoreNotFound({
      where: { id: params.cardId },
      data: body,
      select: {
        column: {
          select: { boardId: true, board: { select: { userId: true } } }
        }
      }
    })

    if (!updatedCard) return next(NotFound('Card not found'))

    await redis.del(
      `board:${updatedCard.column.boardId}:user:${updatedCard.column.board.userId}`
    )

    res.json(updatedCard)
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
      select: { id: true, boardId: true, board: { select: { userId: true } } }
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

      await redis.del(`board:${column.boardId}:user:${column.board.userId}`)

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
      where: { id: params.newColumnId },
      select: { id: true, boardId: true, board: { select: { userId: true } } }
    })

    if (!column) return next(NotFound('Column not found'))

    const newOrder = await this.getNewCardOrder(column.id)

    const updatedCard = await prisma.card.updateIgnoreNotFound({
      where: { id: params.cardId },
      data: { columnId: column.id, order: newOrder }
    })

    if (!updatedCard) return next(NotFound('Card not found'))

    await redis.del(`board:${column.boardId}:user:${column.board.userId}`)

    res.json(updatedCard)
  }

  deleteById = async (
    { params }: TypedRequestParams<typeof CardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const deletedCard = await prisma.card.deleteIgnoreNotFound({
      where: { id: params.cardId },
      select: {
        column: {
          select: { boardId: true, board: { select: { userId: true } } }
        }
      }
    })

    if (!deletedCard) return next(NotFound('Card not found'))

    await redis.del(
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
