import { Router } from 'express'

import { columnController } from '@/controllers'

import { authenticate, validateRequest } from '@/middlewares'

import {
  AddColumnSchema,
  BoardParamsSchema,
  ColumnParamsSchema,
  EditColumnSchema,
  UpdateOrderSchema
} from '@/schemas'

export const columnRouter = Router()

columnRouter.use(authenticate)

columnRouter.post(
  '/:boardId',
  validateRequest({ body: AddColumnSchema, params: BoardParamsSchema }),
  columnController.add
)

columnRouter.patch(
  '/:columnId',
  validateRequest({ body: EditColumnSchema, params: ColumnParamsSchema }),
  columnController.updateById
)

columnRouter.patch(
  '/:boardId/order',
  validateRequest({ body: UpdateOrderSchema, params: BoardParamsSchema }),
  columnController.updateOrder
)

columnRouter.delete(
  '/:columnId',
  validateRequest({ params: ColumnParamsSchema }),
  columnController.deleteById
)
