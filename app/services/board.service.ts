import type { CreateBoardSchema, UpdateBoardSchema } from '@/schemas'
import type { z } from 'zod'

import { prisma } from '@/prisma'
import { invalidate, REDIS_TTL, redisKeys } from '@/redis'
import { HTTPException } from 'hono/http-exception'

import { redisClient } from '@/config'
import boardImages from '@/data/board-bg-images.json'

class BoardService {
  getAll = async (userId: string) => {
    const cacheKey = redisKeys.boards.byUser(userId)

    const cachedBoards = await redisClient.get(cacheKey)

    if (cachedBoards) return JSON.parse(cachedBoards)

    const boards = await prisma.board.findMany({ where: { userId } })

    await redisClient.set(
      cacheKey,
      JSON.stringify(boards),
      'EX',
      REDIS_TTL.DEFAULT
    )

    return boards
  }

  getById = async (boardId: string, userId: string) => {
    const cacheKey = redisKeys.boards.byId(boardId, userId)

    const cachedBoard = await redisClient.get(cacheKey)

    if (cachedBoard) return JSON.parse(cachedBoard)

    const board = await prisma.board.findUnique({
      where: { id: boardId, userId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: { include: { labels: true }, orderBy: { order: 'asc' } }
          }
        }
      }
    })

    if (!board) {
      throw new HTTPException(404, { message: 'Board not found' })
    }

    await redisClient.set(
      cacheKey,
      JSON.stringify(board),
      'EX',
      REDIS_TTL.DEFAULT
    )

    return board
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

    return newBoard
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

    return updatedBoard
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
