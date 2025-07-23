import type {
  AddColumnSchema,
  EditColumnSchema,
  UpdateColumnOrderSchema
} from '@/schemas'
import type z from 'zod'

import { prisma } from '@/prisma'

export const columnService = {
  create: async (
    boardId: string,
    input: z.infer<typeof AddColumnSchema>,
    userId: string
  ) => {
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId }
    })

    if (!board) throw new Error('Board not found')

    const lastColumn = await prisma.column.findFirst({
      where: { boardId: board.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = lastColumn ? lastColumn.order + 1 : 1

    const column = await prisma.column.create({
      data: { ...input, order: newOrder, boardId: board.id }
    })

    return column
  },

  updateById: async (
    columnId: string,
    input: z.infer<typeof EditColumnSchema>
  ) => {
    const updatedColumn = await prisma.column.updateIgnoreNotFound({
      where: { id: columnId },
      data: input
    })

    return updatedColumn
  },

  updateOrder: async (
    boardId: string,
    input: z.infer<typeof UpdateColumnOrderSchema>
  ) => {
    const board = await prisma.board.findFirst({
      where: { id: boardId }
    })

    if (!board) throw new Error('Board not found')

    const transaction = input.ids.map((id, order) =>
      prisma.column.update({
        where: { id },
        data: { order, boardId: board.id }
      })
    )

    try {
      const updatedColumns = await prisma.$transaction(transaction)

      return updatedColumns
    } catch {
      throw new Error('Invalid order')
    }
  },

  deleteById: async (id: string) => {
    const deletedColumn = await prisma.column.deleteIgnoreNotFound({
      where: { id }
    })

    return deletedColumn
  }
}
