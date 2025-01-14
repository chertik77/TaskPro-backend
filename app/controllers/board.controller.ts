import type { NextFunction, Request, Response } from 'express'
import type {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams
} from 'typings/typed-request'

import boardImages from 'data/board-bg-images.json'
import { NotFound } from 'http-errors'
import { prisma } from 'prisma/prisma.client'

import {
  AddBoardSchema,
  BoardParamsSchema,
  EditBoardSchema
} from 'utils/schemas'

class BoardController {
  async getAll({ user }: Request, res: Response) {
    const boards = await prisma.board.findMany({ where: { userId: user.id } })

    res.json(boards)
  }

  async getById(
    { user, params }: TypedRequestParams<typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) {
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

  async add(
    { body, user }: TypedRequestBody<typeof AddBoardSchema>,
    res: Response
  ) {
    const newBoard = await prisma.board.create({
      data: {
        ...body,
        userId: user.id,
        background: boardImages[body.background]
      }
    })

    res.json(newBoard)
  }

  async updateById(
    {
      body,
      params,
      user
    }: TypedRequest<typeof EditBoardSchema, typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) {
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

  async deleteById(
    { params, user }: TypedRequestParams<typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) {
    const deletedBoard = await prisma.board.deleteIgnoreNotFound({
      where: { id: params.boardId, userId: user.id }
    })

    if (!deletedBoard) return next(NotFound('Board not found'))

    res.status(204).send()
  }
}

export const boardController = new BoardController()
