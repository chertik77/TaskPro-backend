import { Router } from 'express'
import { prisma } from 'app'
import createHttpError from 'http-errors'
import {
  validateRequestBody,
  validateRequestParams
} from 'zod-express-middleware'

import { authenticate } from 'middlewares'

import {
  AddCardSchema,
  CardParams,
  ChangeCardColumnParams,
  EditCardSchema
} from 'schemas/card'
import { ColumnParams } from 'schemas/column'

export const cardRouter = Router()

cardRouter.use(authenticate)

cardRouter.post(
  '/:columnId',
  validateRequestParams(ColumnParams),
  validateRequestBody(AddCardSchema),
  async ({ params, body }, res, next) => {
    const isCurrentColumn = await prisma.column.findFirst({
      where: { id: params.columnId }
    })

    if (!isCurrentColumn) {
      return next(createHttpError(404, 'Column not found'))
    }

    const newCard = await prisma.card.create({
      data: { ...body, columnId: params.columnId }
    })

    res.status(201).json(newCard)
  }
)

cardRouter.put(
  '/:cardId',
  validateRequestParams(CardParams),
  validateRequestBody(EditCardSchema),
  async ({ params, body }, res, next) => {
    const updatedCard = await prisma.card.update({
      where: { id: params.cardId },
      data: body
    })

    if (!updatedCard) {
      return next(createHttpError(404, 'Card not found'))
    }

    res.json(updatedCard)
  }
)

cardRouter.delete(
  '/:cardId',
  validateRequestParams(CardParams),
  async ({ params }, res, next) => {
    const deletedCard = await prisma.card.delete({
      where: { id: params.cardId }
    })

    if (!deletedCard) {
      return next(createHttpError(404, 'Card not found'))
    }

    res.status(204).send()
  }
)

cardRouter.patch(
  '/:cardId/:newColumnId',
  validateRequestParams(ChangeCardColumnParams),
  async ({ params }, res, next) => {
    const { newColumnId, cardId } = params

    const existColumn = await prisma.column.findFirst({
      where: { id: newColumnId }
    })

    if (!existColumn) {
      return next(createHttpError(404, 'Column Not Found'))
    }

    const result = await prisma.card.update({
      where: { id: cardId },
      data: { columnId: newColumnId }
    })

    if (!result) {
      return next(createHttpError(404, 'Card Not Found'))
    }

    res.json(result)
  }
)
