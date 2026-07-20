import type {
  BoardParamsSchema,
  ColumnParamsSchema,
  CreateBoardSchema,
  UpdateColumnOrderSchema,
  UpdateColumnSchema
} from '@/schemas'
import type { TypedRequest, TypedRequestParams } from '@/types'
import type { NextFunction, Response } from 'express'
import type { ZodType } from 'zod'

import { prisma } from '@/prisma'
import { invalidate } from '@/redis'
import { BadRequest, NotFound } from 'http-errors'

class ColumnController {
  create = async (
    {
      params,
      user,
      body
    }: TypedRequest<
      typeof BoardParamsSchema,
      ZodType,
      typeof CreateBoardSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    const board = await prisma.board.findUnique({
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

    await invalidate.board(user.id, board.id)

    res.json(column)
  }

  updateById = async (
    {
      user,
      params,
      body
    }: TypedRequest<
      typeof ColumnParamsSchema,
      ZodType,
      typeof UpdateColumnSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    const updatedColumn = await prisma.column.updateIgnoreNotFound({
      where: { id: params.columnId },
      include: { board: { select: { userId: true } } },
      data: body
    })

    if (!updatedColumn) return next(NotFound('Column not found'))

    await invalidate.board(user.id, updatedColumn.boardId)

    res.json(updatedColumn)
  }

  updateOrder = async (
    {
      user,
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
    const board = await prisma.board.findUnique({
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

      await invalidate.board(user.id, board.id)

      res.json(updatedColumns)
    } catch {
      return next(BadRequest('Invalid order'))
    }
  }

  deleteById = async (
    { user, params }: TypedRequestParams<typeof ColumnParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const deletedColumn = await prisma.column.deleteIgnoreNotFound({
      where: { id: params.columnId },
      include: { board: { select: { userId: true } } }
    })

    if (!deletedColumn) return next(NotFound('Column not found'))

    await invalidate.board(user.id, deletedColumn.boardId)

    res.sendStatus(204)
  }
}

export const columnController = new ColumnController()
