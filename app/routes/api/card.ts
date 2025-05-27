import { Router } from 'express'

import { cardController } from '@/controllers'

import { authenticate, validateRequest } from '@/middlewares'

import {
  AddCardSchema,
  CardParamsSchema,
  ColumnParamsSchema,
  EditCardSchema,
  MoveCardSchema,
  UpdateOrderSchema
} from '@/schemas'

export const cardRouter = Router()

cardRouter.use(authenticate)

cardRouter.post(
  '/:columnId',
  validateRequest({ body: AddCardSchema, params: ColumnParamsSchema }),
  cardController.add
)

cardRouter.post(
  '/:cardId/:newColumnId',
  validateRequest({ params: MoveCardSchema }),
  cardController.move
)

cardRouter.patch(
  '/:cardId',
  validateRequest({ body: EditCardSchema, params: CardParamsSchema }),
  cardController.updateById
)

cardRouter.patch(
  '/:columnId/order',
  validateRequest({ body: UpdateOrderSchema, params: ColumnParamsSchema }),
  cardController.updateOrder
)

cardRouter.delete(
  '/:cardId',
  validateRequest({ params: CardParamsSchema }),
  cardController.deleteById
)
