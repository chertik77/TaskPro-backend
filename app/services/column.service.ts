import type {
  CreateColumnSchema,
  UpdateColumnSchema,
  UpdateColumnsOrderSchema
} from '@/schemas'
import type z from 'zod'

import { prisma } from '@/prisma'
import { invalidate } from '@/redis'
import { HTTPException } from 'hono/http-exception'

import { getRebalancedOrder, ORDER_STEP } from '@/utils'

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

    const newOrder = lastColumn ? lastColumn.order + ORDER_STEP : 0

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
      where: { id: columnId, board: { userId } },
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
      where: { id: boardId, userId },
      select: { id: true }
    })

    if (!board) {
      throw new HTTPException(404, { message: 'Board not found' })
    }

    const uniqueIds = [...new Set(data.ids)]

    const ownedCount = await prisma.column.count({
      where: { id: { in: uniqueIds }, boardId: board.id }
    })

    if (ownedCount !== uniqueIds.length) {
      throw new HTTPException(404, { message: 'Column not found' })
    }

    const transaction = uniqueIds.map((id, index) =>
      prisma.column.update({
        where: { id, board: { userId } },
        data: { order: getRebalancedOrder(index) }
      })
    )

    try {
      await prisma.$transaction(transaction)
    } catch {
      throw new HTTPException(400, { message: 'Invalid order' })
    }

    await invalidate.board(userId, board.id)
  }

  deleteById = async (columnId: string, userId: string) => {
    const deletedColumn = await prisma.column.deleteIgnoreNotFound({
      where: { id: columnId, board: { userId } }
    })

    if (!deletedColumn) {
      throw new HTTPException(404, { message: 'Column not found' })
    }

    await invalidate.board(userId, deletedColumn.boardId)
  }
}

export const columnService = new ColumnService()
