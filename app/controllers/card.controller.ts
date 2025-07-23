import type {
  AddCardSchema,
  CardParamsSchema,
  ColumnParamsSchema,
  EditCardSchema,
  MoveCardSchema,
  UpdateCardOrderSchema
} from '@/schemas'
import type { NextFunction, Response } from 'express'
import type { ZodType } from 'zod'
import type { TypedRequest, TypedRequestParams } from 'zod-express-middleware'

import { cardService } from '@/services'
import { NotFound } from 'http-errors'

export const cardController = {
  add: async (
    {
      params,
      body
    }: TypedRequest<typeof ColumnParamsSchema, ZodType, typeof AddCardSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const newCard = await cardService.create(params.columnId, body)
      res.json(newCard)
    } catch (error) {
      next(error)
    }
  },

  updateById: async (
    {
      params,
      body
    }: TypedRequest<typeof CardParamsSchema, ZodType, typeof EditCardSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const updatedCard = await cardService.updateById(params.cardId, body)

    if (!updatedCard) return next(NotFound('Card not found'))

    res.json(updatedCard)
  },

  updateOrder: async (
    {
      params,
      body
    }: TypedRequest<
      typeof ColumnParamsSchema,
      ZodType,
      typeof UpdateCardOrderSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const updatedCards = await cardService.updateOrder(params.columnId, body)
      res.json(updatedCards)
    } catch (error) {
      next(error)
    }
  },

  move: async (
    { params }: TypedRequestParams<typeof MoveCardSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const updatedCard = await cardService.changeColumn(
        params.cardId,
        params.newColumnId
      )
      res.json(updatedCard)
    } catch (error) {
      next(error)
    }
  },

  deleteById: async (
    { params }: TypedRequestParams<typeof CardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const deletedCard = await cardService.deleteById(params.cardId)

    if (!deletedCard) return next(NotFound('Card not found'))

    res.status(204).send()
  }
}
