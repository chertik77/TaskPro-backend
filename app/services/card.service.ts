import type {
  AddCardSchema,
  EditCardSchema,
  UpdateCardOrderSchema
} from '@/schemas'
import type z from 'zod'

import { prisma } from '@/prisma'

class CardService {
  create = async (columnId: string, input: z.infer<typeof AddCardSchema>) => {
    const column = await prisma.column.findFirst({
      where: { id: columnId }
    })

    if (!column) throw new Error('Column not found')

    const newOrder = await this.getNewCardOrder(column.id)

    const newCard = await prisma.card.create({
      data: { ...input, columnId: column.id, order: newOrder }
    })

    return newCard
  }

  updateById = async (id: string, input: z.infer<typeof EditCardSchema>) => {
    const updatedCard = await prisma.card.updateIgnoreNotFound({
      where: { id },
      data: input
    })

    return updatedCard
  }

  updateOrder = async (
    columnId: string,
    input: z.infer<typeof UpdateCardOrderSchema>
  ) => {
    const column = await prisma.column.findFirst({
      where: { id: columnId }
    })

    if (!column) throw new Error('Column not found')

    const transaction = input.ids.map((id, order) =>
      prisma.card.update({
        where: { id },
        data: { order, columnId: column.id }
      })
    )

    try {
      const updatedCards = await prisma.$transaction(transaction)

      return updatedCards
    } catch {
      throw new Error('Invalid order')
    }
  }

  changeColumn = async (cardId: string, newColumnId: string) => {
    const column = await prisma.column.findFirst({
      where: { id: newColumnId }
    })

    if (!column) throw new Error('Column not found')

    const newOrder = await this.getNewCardOrder(column.id)

    const updatedCard = await prisma.card.updateIgnoreNotFound({
      where: { id: cardId },
      data: { columnId: column.id, order: newOrder }
    })

    return updatedCard
  }

  deleteById = async (id: string) => {
    const deletedCard = await prisma.card.deleteIgnoreNotFound({
      where: { id }
    })

    return deletedCard
  }

  private getNewCardOrder = async (columnId: string) => {
    const lastCard = await prisma.card.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = lastCard ? lastCard.order + 1 : 1

    return newOrder
  }
}

export const cardService = new CardService()
