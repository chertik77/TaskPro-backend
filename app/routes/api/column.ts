import { Router } from 'express'
import { prisma } from 'app'
import createHttpError from 'http-errors'
import {
  validateRequestBody,
  validateRequestParams
} from 'zod-express-middleware'

import { authenticate } from 'middlewares'

import { BoardParamsSchema, UpdateOrderSchema } from 'schemas/board'
import { AddColumnSchema, ColumnParamsSchema } from 'schemas/column'

export const columnRouter = Router()

columnRouter.use(authenticate)

columnRouter.post(
  '/:boardId',
  validateRequestParams(BoardParamsSchema),
  validateRequestBody(AddColumnSchema),
  async ({ params, user, body }, res, next) => {
    const board = await prisma.board.findFirst({
      where: { id: params.boardId, userId: user.id }
    })

    if (!board) {
      return next(createHttpError(404, `Board not found`))
    }

    const lastColumn = await prisma.column.findFirst({
      where: { boardId: params.boardId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = lastColumn ? lastColumn.order + 1 : 1

    const column = await prisma.column.create({
      data: { ...body, order: newOrder, boardId: board.id }
    })

    res.status(201).json(column)
  }
)

columnRouter.put(
  '/:columnId',
  validateRequestParams(ColumnParamsSchema),
  async ({ params, body }, res, next) => {
    const updatedColumn = await prisma.column.update({
      where: { id: params.columnId },
      data: body
    })

    if (!updatedColumn) {
      return next(createHttpError(404, 'Column not found'))
    }

    res.json(updatedColumn)
  }
)

columnRouter.patch(
  '/:boardId/order',
  validateRequestParams(BoardParamsSchema),
  validateRequestBody(UpdateOrderSchema),
  async ({ params, body }, res, next) => {
    const board = await prisma.board.findFirst({
      where: { id: params.boardId }
    })

    if (!board) {
      return next(createHttpError(404, 'Board not found'))
    }

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
      return next(createHttpError(400, 'Invalid order'))
    }
  }
)

columnRouter.delete(
  '/:columnId',
  validateRequestParams(ColumnParamsSchema),
  async ({ params }, res, next) => {
    const deletedColumn = await prisma.column.delete({
      where: { id: params.columnId }
    })

    if (!deletedColumn) {
      return next(createHttpError(404, `Column Not Found`))
    }

    res.status(204).send()
  }
)
