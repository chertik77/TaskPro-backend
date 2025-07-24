import { Router } from 'express'
import { validateRequest } from 'zod-express-middleware'

import { columnController } from '@/controllers'

import { authenticate } from '@/middlewares'

import {
  AddColumnSchema,
  BoardParamsSchema,
  ColumnParamsSchema,
  EditColumnSchema,
  UpdateColumnOrderSchema
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
  validateRequest({ body: UpdateColumnOrderSchema, params: BoardParamsSchema }),
  columnController.updateOrder
)

columnRouter.delete(
  '/:columnId',
  validateRequest({ params: ColumnParamsSchema }),
  columnController.deleteById
)
