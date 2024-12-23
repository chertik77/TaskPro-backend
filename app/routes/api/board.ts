import { Router } from 'express'
import boardImages from 'data/board-bg-images.json'
import { NotFound } from 'http-errors'
import { prisma } from 'prisma.client'

import { authenticate, validateRequest } from 'middlewares'

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
  validateRequest({ params: BoardParamsSchema }),
  async ({ user, params }, res, next) => {
    const board = await prisma.board.findFirst({
      where: { id: params.boardId, userId: user.id },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: { cards: { orderBy: { order: 'asc' } } }
        }
      }
    })

    if (!board) return next(NotFound('Board not found'))

    res.json(board)
  }
)

boardRouter.post(
  '/',
  validateRequest({ body: AddBoardSchema }),
  async ({ body, user }, res) => {
    const newBoard = await prisma.board.create({
      data: {
        ...body,
        userId: user.id,
        background: boardImages[body.background]
      }
    })

    res.json(newBoard)
  }
)

boardRouter.put(
  '/:boardId',
  validateRequest({ body: EditBoardSchema, params: BoardParamsSchema }),
  async ({ body, params, user }, res, next) => {
    const updatedBoard = await prisma.board.updateIgnoreNotFound({
      where: { id: params.boardId, userId: user.id },
      data: {
        ...body,
        background: body.background && boardImages[body.background]
      }
    })

    if (!updatedBoard) return next(NotFound('Board not found'))

    res.json(updatedBoard)
  }
)

boardRouter.delete(
  '/:boardId',
  validateRequest({ params: BoardParamsSchema }),
  async ({ params, user }, res, next) => {
    const deletedBoard = await prisma.board.deleteIgnoreNotFound({
      where: { id: params.boardId, userId: user.id }
    })

    if (!deletedBoard) return next(NotFound('Board not found'))

    res.status(204).send()
  }
)
