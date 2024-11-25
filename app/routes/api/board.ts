import { Router } from 'express'
import { prisma } from 'app'
import boardImages from 'data/board-bg-images.json'
import createHttpError from 'http-errors'
import {
  validateRequestBody,
  validateRequestParams
} from 'zod-express-middleware'

import { authenticate } from 'middlewares'

import {
  AddBoardSchema,
  BoardParamsSchema,
  EditBoardSchema
} from 'schemas/board'

export const boardRouter = Router()

boardRouter.use(authenticate)

boardRouter.get('/', async ({ user }, res) => {
  const boards = await prisma.board.findMany({ where: { userId: user.id } })

  res.json(boards)
})

boardRouter.get(
  '/:boardId',
  validateRequestParams(BoardParamsSchema),
  async ({ user, params }, res, next) => {
    const board = await prisma.board.findFirst({
      where: { id: params.boardId, userId: user.id },
      include: {
        columns: { include: { cards: { orderBy: { order: 'asc' } } } }
      }
    })

    if (!board) {
      return next(createHttpError(404, `Board not found`))
    }

    res.json(board)
  }
)

boardRouter.post(
  '/',
  validateRequestBody(AddBoardSchema),
  async ({ body, user }, res) => {
    const newBoard = await prisma.board.create({
      data: {
        ...body,
        userId: user.id,
        background: boardImages[body.background]
      }
    })

    res.status(201).json(newBoard)
  }
)

boardRouter.put(
  '/:boardId',
  validateRequestParams(BoardParamsSchema),
  validateRequestBody(EditBoardSchema),
  async ({ body, params, user }, res, next) => {
    const updatedBoard = await prisma.board.update({
      where: { id: params.boardId, userId: user.id },
      data: {
        ...body,
        background: body.background && boardImages[body.background]
      }
    })

    if (!updatedBoard) {
      return next(createHttpError(404, `Board not found`))
    }

    res.json(updatedBoard)
  }
)

boardRouter.delete(
  '/:boardId',
  validateRequestParams(BoardParamsSchema),
  async ({ params, user }, res, next) => {
    const deletedBoard = await prisma.board.delete({
      where: { id: params.boardId, userId: user.id }
    })

    if (!deletedBoard) {
      return next(createHttpError(404, `Board not found`))
    }

    res.status(204).send()
  }
)
