import type {
  AddBoardSchema,
  BoardParamsSchema,
  ColumnParamsSchema,
  EditColumnSchema,
  UpdateColumnOrderSchema
} from '@/schemas'
import type { NextFunction, Response } from 'express'
import type { ZodType } from 'zod'
import type { TypedRequest, TypedRequestParams } from 'zod-express-middleware'

import { prisma } from '@/prisma'
import { BadRequest, NotFound } from 'http-errors'

import { redisClient } from '@/config'

class ColumnController {
  add = async (
    {
      params,
      user,
      body
    }: TypedRequest<typeof BoardParamsSchema, ZodType, typeof AddBoardSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const board = await prisma.board.findFirst({
      where: { id: params.boardId, userId: user.id }
    })

    if (!board) return next(NotFound('Board not found'))

    const lastColumn = await prisma.column.findFirst({
      where: { boardId: board.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = lastColumn ? lastColumn.order + 1 : 1

    const column = await prisma.column.create({
      data: { ...body, order: newOrder, boardId: board.id }
    })

    await redisClient.del(`board:${params.boardId}:user:${user.id}`)

    res.json(column)
  }

  updateById = async (
    {
      params,
      body
    }: TypedRequest<
      typeof ColumnParamsSchema,
      ZodType,
      typeof EditColumnSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    const updatedColumn = await prisma.column.updateIgnoreNotFound({
      where: { id: params.columnId },
      include: { cards: true, board: { select: { userId: true } } },
      data: body
    })

    if (!updatedColumn) return next(NotFound('Column not found'))

    const { board, ...column } = updatedColumn

    await redisClient.del(`board:${updatedColumn.boardId}:user:${board.userId}`)

    res.json(column)
  }

  updateOrder = async (
    {
      params,
      body
    }: TypedRequest<
      typeof BoardParamsSchema,
      ZodType,
      typeof UpdateColumnOrderSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    const board = await prisma.board.findFirst({
      where: { id: params.boardId }
    })

    if (!board) return next(NotFound('Board not found'))

    const transaction = body.ids.map((id, order) =>
      prisma.column.update({
        where: { id },
        data: { order, boardId: board.id }
      })
    )

    try {
      const updatedColumns = await prisma.$transaction(transaction)

      await redisClient.del(`board:${board.id}:user:${board.userId}`)

      res.json(updatedColumns)
    } catch {
      return next(BadRequest('Invalid order'))
    }
  }

  deleteById = async (
    { params }: TypedRequestParams<typeof ColumnParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const deletedColumn = await prisma.column.deleteIgnoreNotFound({
      where: { id: params.columnId },
      select: { boardId: true, board: { select: { userId: true } } }
    })

    if (!deletedColumn) return next(NotFound('Column not found'))

    await redisClient.del(
      `board:${deletedColumn.boardId}:user:${deletedColumn.board.userId}`
    )

    res.sendStatus(204)
  }
}

export const columnController = new ColumnController()
