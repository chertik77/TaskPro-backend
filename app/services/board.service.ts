import type { AddBoardSchema, EditBoardSchema } from '@/schemas'
import type { z } from 'zod'

import { prisma } from '@/prisma'

import boardImages from '@/data/board-bg-images.json'

export const boardService = {
  getAll: async (userId: string) => {
    const boards = await prisma.board.findMany({
      where: { userId }
    })

    return boards
  },

  getById: async (id: string, userId: string) => {
    const board = await prisma.board.findFirst({
      where: { id, userId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: { cards: { orderBy: { order: 'asc' } } }
        }
      }
    })

    return board
  },

  create: async (input: z.infer<typeof AddBoardSchema>, userId: string) => {
    const newBoard = await prisma.board.create({
      data: {
        ...input,
        background: boardImages[input.background],
        userId
      }
    })

    return newBoard
  },

  updateById: async (
    id: string,
    input: z.infer<typeof EditBoardSchema>,
    userId: string
  ) => {
    const updatedBoard = await prisma.board.updateIgnoreNotFound({
      where: { id, userId },
      data: {
        ...input,
        background: input.background && boardImages[input.background]
      }
    })

    return updatedBoard
  },

  deleteById: async (id: string, userId: string) => {
    const deletedBoard = await prisma.board.deleteIgnoreNotFound({
      where: { id, userId }
    })

    return deletedBoard
  }
}
