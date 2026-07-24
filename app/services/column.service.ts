import type {
  CreateColumnSchema,
  UpdateColumnSchema,
  UpdateColumnsOrderSchema
} from '@/schemas'
import type z from 'zod'

import { prisma } from '@/prisma'
import { invalidate } from '@/redis'
import { HTTPException } from 'hono/http-exception'

class ColumnService {
  create = async (
    data: z.infer<typeof CreateColumnSchema>,
    boardId: string,
    userId: string
  ) => {
    const board = await prisma.board.findUnique({
      where: { id: boardId, userId }
    })

    if (!board) {
      throw new HTTPException(404, { message: 'Board not found' })
    }

    const lastColumn = await prisma.column.findFirst({
      where: { boardId: board.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = lastColumn ? lastColumn.order + 1 : 1

    const column = await prisma.column.create({
      data: { ...data, order: newOrder, boardId: board.id }
    })

    await invalidate.board(userId, board.id)

    return column
  }

  updateById = async (
    data: z.infer<typeof UpdateColumnSchema>,
    columnId: string,
    userId: string
  ) => {
    const updatedColumn = await prisma.column.updateIgnoreNotFound({
      where: { id: columnId },
      include: { board: { select: { userId: true } } },
      data
    })

    if (!updatedColumn) {
      throw new HTTPException(404, { message: 'Column not found' })
    }

    await invalidate.board(userId, updatedColumn.boardId)

    return updatedColumn
  }

  updateOrder = async (
    data: z.infer<typeof UpdateColumnsOrderSchema>,
    boardId: string,
    userId: string
  ) => {
    const board = await prisma.board.findUnique({
      where: { id: boardId }
    })

    if (!board) {
      throw new HTTPException(404, { message: 'Board not found' })
    }

    const transaction = data.ids.map((id, order) =>
      prisma.column.update({
        where: { id },
        data: { order, boardId: board.id }
      })
    )

    try {
      const updatedColumns = await prisma.$transaction(transaction)

      await invalidate.board(userId, board.id)

      return updatedColumns
    } catch {
      throw new HTTPException(400, { message: 'Invalid order' })
    }
  }

  deleteById = async (columnId: string, userId: string) => {
    const deletedColumn = await prisma.column.deleteIgnoreNotFound({
      where: { id: columnId },
      include: { board: { select: { userId: true } } }
    })

    if (!deletedColumn) {
      throw new HTTPException(404, { message: 'Column not found' })
    }

    await invalidate.board(userId, deletedColumn.boardId)
  }
}

export const columnService = new ColumnService()
