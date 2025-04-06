import type {
  AddColumnSchema,
  BoardParamsSchema,
  ColumnParamsSchema,
  EditColumnSchema,
  UpdateOrderSchema
} from '@/schemas'
import type { TypedRequest, TypedRequestParams } from '@/types'
import type { NextFunction, Response } from 'express'

import { BadRequest, NotFound } from 'http-errors'

import { prisma } from '@/config/prisma'

class ColumnController {
  async add(
    {
      params,
      user,
      body
    }: TypedRequest<typeof AddColumnSchema, typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) {
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

    res.json(column)
  }

  async updateById(
    {
      params,
      body
    }: TypedRequest<typeof EditColumnSchema, typeof ColumnParamsSchema>,
    res: Response,
    next: NextFunction
  ) {
    const updatedColumn = await prisma.column.updateIgnoreNotFound({
      where: { id: params.columnId },
      data: body
    })

    if (!updatedColumn) return next(NotFound('Column not found'))

    res.json(updatedColumn)
  }

  async updateOrder(
    {
      params,
      body
    }: TypedRequest<typeof UpdateOrderSchema, typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) {
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
      res.json(updatedColumns)
    } catch {
      return next(BadRequest('Invalid order'))
    }
  }

  async deleteById(
    { params }: TypedRequestParams<typeof ColumnParamsSchema>,
    res: Response,
    next: NextFunction
  ) {
    const deletedColumn = await prisma.column.deleteIgnoreNotFound({
      where: { id: params.columnId }
    })

    if (!deletedColumn) return next(NotFound('Column not found'))

    res.status(204).send()
  }
}

export const columnController = new ColumnController()
