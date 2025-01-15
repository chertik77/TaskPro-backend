import type {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams
} from '@/types/typed-request'
import type { NextFunction, Request, Response } from 'express'

import { prisma } from '@prisma'
import { NotFound } from 'http-errors'

import boardImages from '@/data/board-bg-images.json'

import {
  AddBoardSchema,
  BoardParamsSchema,
  EditBoardSchema
} from '@/utils/schemas'

class BoardController {
  getAll = async ({ user }: Request, res: Response) => {
    const boards = await prisma.board.findMany({ where: { userId: user.id } })

    res.json(boards)
  }

  getById = async (
    { user, params }: TypedRequestParams<typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
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

  add = async (
    { body, user }: TypedRequestBody<typeof AddBoardSchema>,
    res: Response
  ) => {
    const newBoard = await prisma.board.create({
      data: {
        ...body,
        userId: user.id,
        background: boardImages[body.background]
      }
    })

    res.json(newBoard)
  }

  updateById = async (
    {
      body,
      params,
      user
    }: TypedRequest<typeof EditBoardSchema, typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
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

  deleteById = async (
    { params, user }: TypedRequestParams<typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const deletedBoard = await prisma.board.deleteIgnoreNotFound({
      where: { id: params.boardId, userId: user.id }
    })

    if (!deletedBoard) return next(NotFound('Board not found'))

    res.status(204).send()
  }
}

export const boardController = new BoardController()
