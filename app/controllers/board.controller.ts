import type {
  BoardParamsSchema,
  CreateBoardSchema,
  UpdateBoardSchema
} from '@/schemas'
import type {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams
} from '@/types'
import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'

import { prisma } from '@/prisma'
import { invalidate, REDIS_TTL, redisKeys } from '@/redis'
import { NotFound } from 'http-errors'

import { redisClient } from '@/config'
import boardImages from '@/data/board-bg-images.json'

class BoardController {
  getAll = async ({ user }: Request, res: Response) => {
    const cacheKey = redisKeys.boards.byUser(user.id)

    const cachedBoards = await redisClient.get(cacheKey)

    if (cachedBoards) {
      res.json(JSON.parse(cachedBoards))
    } else {
      const boards = await prisma.board.findMany({ where: { userId: user.id } })

      await redisClient.set(
        cacheKey,
        JSON.stringify(boards),
        'EX',
        REDIS_TTL.DEFAULT
      )

      res.json(boards)
    }
  }

  getById = async (
    { user, params }: TypedRequestParams<typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const cacheKey = redisKeys.boards.byId(params.boardId, user.id)

    const cachedBoard = await redisClient.get(cacheKey)

    if (cachedBoard) {
      res.json(JSON.parse(cachedBoard))
    } else {
      const board = await prisma.board.findUnique({
        where: { id: params.boardId, userId: user.id },
        include: {
          columns: {
            orderBy: { order: 'asc' },
            include: {
              tasks: { include: { labels: true }, orderBy: { order: 'asc' } }
            }
          }
        }
      })

      if (!board) return next(NotFound('Board not found'))

      await redisClient.set(
        cacheKey,
        JSON.stringify(board),
        'EX',
        REDIS_TTL.DEFAULT
      )

      res.json(board)
    }
  }

  create = async (
    { body, user }: TypedRequestBody<typeof CreateBoardSchema>,
    res: Response
  ) => {
    const newBoard = await prisma.board.create({
      data: {
        ...body,
        userId: user.id,
        background: {
          identifier: body.background,
          url: boardImages[body.background]
        }
      }
    })

    await invalidate.boards(user.id)

    res.json(newBoard)
  }

  updateById = async (
    {
      body,
      params,
      user
    }: TypedRequest<
      typeof BoardParamsSchema,
      ZodType,
      typeof UpdateBoardSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    const updatedBoard = await prisma.board.updateIgnoreNotFound({
      where: { id: params.boardId, userId: user.id },
      data: {
        ...body,
        background: body.background
          ? {
              identifier: body.background,
              url: boardImages[body.background]
            }
          : undefined
      }
    })

    if (!updatedBoard) return next(NotFound('Board not found'))

    await invalidate.boardRelated(user.id, updatedBoard.id)

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

    await invalidate.boardRelated(user.id, deletedBoard.id)

    res.sendStatus(204)
  }
}

export const boardController = new BoardController()
