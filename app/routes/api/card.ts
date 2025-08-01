import { Router } from 'express'

import { cardController } from '@/controllers'

import { authenticate, validateRequest } from '@/middlewares'

import {
  AddCardSchema,
  CardParamsSchema,
  ColumnParamsSchema,
  EditCardSchema,
  UpdateCardOrderSchema
} from '@/schemas'

export const cardRouter = Router()

cardRouter.use(authenticate)

cardRouter.post(
  '/:columnId',
  validateRequest({ body: AddCardSchema, params: ColumnParamsSchema }),
  cardController.add
)

cardRouter.patch(
  '/:cardId',
  validateRequest({ body: EditCardSchema, params: CardParamsSchema }),
  cardController.updateById
)

cardRouter.patch(
  '/:columnId/order',
  validateRequest({ body: UpdateCardOrderSchema, params: ColumnParamsSchema }),
  cardController.updateOrder
)

cardRouter.delete(
  '/:cardId',
  validateRequest({ params: CardParamsSchema }),
  cardController.deleteById
)
