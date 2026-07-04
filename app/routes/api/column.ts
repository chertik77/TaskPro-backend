import { Router } from 'express'

import { columnController } from '@/controllers'

import { requireAuth, validateRequest } from '@/middlewares'

import {
  BoardParamsSchema,
  ColumnParamsSchema,
  CreateColumnSchema,
  UpdateColumnOrderSchema,
  UpdateColumnSchema
} from '@/schemas'

export const columnRouter = Router()

columnRouter.use(requireAuth)

columnRouter.post(
  '/:boardId',
  validateRequest({ body: CreateColumnSchema, params: BoardParamsSchema }),
  columnController.create
)

columnRouter.patch(
  '/:columnId',
  validateRequest({ body: UpdateColumnSchema, params: ColumnParamsSchema }),
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
