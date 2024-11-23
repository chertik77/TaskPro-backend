import { Router } from 'express'
import { prisma } from 'app'
import createHttpError from 'http-errors'
import {
  validateRequestBody,
  validateRequestParams
} from 'zod-express-middleware'

import { authenticate } from 'middlewares'

import { BoardParams } from 'schemas/board'
import { AddColumnSchema, ColumnParams } from 'schemas/column'

export const columnRouter = Router()

columnRouter.use(authenticate)

columnRouter.post(
  '/:boardId',
  validateRequestParams(BoardParams),
  validateRequestBody(AddColumnSchema),
  async ({ params, user, body }, res, next) => {
    const board = await prisma.board.findFirst({
      where: { id: params.boardId, userId: user.id }
    })

    if (!board) {
      return next(createHttpError(404, `Board not found`))
    }

    const { id, title } = await prisma.column.create({
      data: { ...body, boardId: board.id }
    })

    res.status(201).json({ id, title })
  }
)

columnRouter.put(
  '/:columnId',
  validateRequestParams(ColumnParams),
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

columnRouter.delete(
  '/:columnId',
  validateRequestParams(ColumnParams),
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
