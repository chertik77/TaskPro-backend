import type {
  BoardSchema,
  CreateBoardSchema,
  UpdateBoardSchema
} from '@/schemas'
import type { z } from '@hono/zod-openapi'

import { HTTPException } from 'hono/http-exception'

import { redisClient } from '@/config'
import boardImages from '@/data/board-bg-images.json'
import { prisma } from '@/prisma'
import { cached, invalidate, REDIS_TTL, redisKeys } from '@/redis'

type Board = z.infer<typeof BoardSchema>

class BoardService {
  getAll = (userId: string) =>
    cached(
      redisKeys.boards.byUser(userId),
      REDIS_TTL.DEFAULT,
      () =>
        prisma.board.findMany({ where: { userId } }) as Promise<
          Omit<Board, 'columns'>[]
        >
    )

  getById = async (boardId: string, userId: string) => {
    const version =
      (await redisClient.get(redisKeys.boards.version(boardId, userId))) ?? '0'

    const cacheKey = redisKeys.boards.byId(boardId, userId, version)

    return cached(cacheKey, REDIS_TTL.DEFAULT, async () => {
      const board = await prisma.board.findUnique({
        where: { id: boardId, userId },
        include: {
          columns: {
            orderBy: [{ order: 'asc' }, { id: 'asc' }],
            include: {
              tasks: {
                include: { labels: true },
                orderBy: [{ order: 'asc' }, { id: 'asc' }]
              }
            }
          }
        }
      })

      if (!board) {
        throw new HTTPException(404, { message: 'Board not found' })
      }

      return board as Board
    })
  }

  create = async (data: z.infer<typeof CreateBoardSchema>, userId: string) => {
    const newBoard = await prisma.board.create({
      data: {
        ...data,
        userId,
        background: {
          identifier: data.background,
          url: boardImages[data.background]
        }
      }
    })

    await invalidate.boards(userId)

    return newBoard as Board
  }

  updateById = async (
    data: z.infer<typeof UpdateBoardSchema>,
    boardId: string,
    userId: string
  ) => {
    const updatedBoard = await prisma.board.updateIgnoreNotFound({
      where: { id: boardId, userId },
      data: {
        ...data,
        background: data.background
          ? {
              identifier: data.background,
              url: boardImages[data.background]
            }
          : undefined
      }
    })

    if (!updatedBoard) {
      throw new HTTPException(404, { message: 'Board not found' })
    }

    await invalidate.boardRelated(userId, updatedBoard.id)

    return updatedBoard as Board
  }

  deleteById = async (boardId: string, userId: string) => {
    const deletedBoard = await prisma.board.deleteIgnoreNotFound({
      where: { id: boardId, userId }
    })

    if (!deletedBoard) {
      throw new HTTPException(404, { message: 'Board not found' })
    }

    await invalidate.boardRelated(userId, deletedBoard.id)
  }
}

export const boardService = new BoardService()
