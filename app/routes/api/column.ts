import { Router } from 'express'
import { prisma } from 'app'
import { BadRequest, NotFound } from 'http-errors'

import { authenticate, validateRequest } from 'middlewares'

import { BoardParamsSchema, UpdateOrderSchema } from 'schemas/board'
import {
  AddColumnSchema,
  ColumnParamsSchema,
  EditColumnSchema
} from 'schemas/column'

export const columnRouter = Router()

columnRouter.use(authenticate)

columnRouter.post(
  '/:boardId',
  validateRequest({ body: AddColumnSchema, params: BoardParamsSchema }),
  async ({ params, user, body }, res, next) => {
    const board = await prisma.board.findFirst({
      where: { id: params.boardId, userId: user.id }
    })

    if (!board) return next(NotFound('Board not found'))

    const lastColumn = await prisma.column.findFirst({
      where: { boardId: params.boardId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = lastColumn ? lastColumn.order + 1 : 1

    const column = await prisma.column.create({
      data: { ...body, order: newOrder, boardId: board.id }
    })

    res.json(column)
  }
)

columnRouter.put(
  '/:columnId',
  validateRequest({ body: EditColumnSchema, params: ColumnParamsSchema }),
  async ({ params, body }, res, next) => {
    const updatedColumn = await prisma.column.update({
      where: { id: params.columnId },
      data: body
    })

    if (!updatedColumn) return next(NotFound('Column not found'))

    res.json(updatedColumn)
  }
)

columnRouter.patch(
  '/:boardId/order',
  validateRequest({ body: UpdateOrderSchema, params: BoardParamsSchema }),
  async ({ params, body }, res, next) => {
    const board = await prisma.board.findFirst({
      where: { id: params.boardId }
    })

    if (!board) return next(NotFound('Board not found'))

    const transaction = body.ids.map((id, order) =>
      prisma.column.update({
        where: { id },
        data: { order, boardId: params.boardId }
      })
    )

    try {
      const updatedColumns = await prisma.$transaction(transaction)
      res.json(updatedColumns)
    } catch {
      return next(BadRequest('Invalid order'))
    }
  }
)

columnRouter.delete(
  '/:columnId',
  validateRequest({ params: ColumnParamsSchema }),
  async ({ params }, res, next) => {
    const deletedColumn = await prisma.column.delete({
      where: { id: params.columnId }
    })

    if (!deletedColumn) return next(NotFound('Column not found'))

    res.status(204).send()
  }
)
