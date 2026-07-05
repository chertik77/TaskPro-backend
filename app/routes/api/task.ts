import { Router } from 'express'

import { taskController } from '@/controllers'

import { requireAuth, validateRequest } from '@/middlewares'

import {
  ColumnParamsSchema,
  CreateTaskSchema,
  TaskParamsSchema,
  UpdateTaskOrderSchema,
  UpdateTaskSchema
} from '@/schemas'

export const taskRouter = Router()

taskRouter.use(requireAuth)

taskRouter.post(
  '/:columnId',
  validateRequest({ body: CreateTaskSchema, params: ColumnParamsSchema }),
  taskController.create
)

taskRouter.patch(
  '/:taskId',
  validateRequest({ body: UpdateTaskSchema, params: TaskParamsSchema }),
  taskController.updateById
)

taskRouter.patch(
  '/:columnId/order',
  validateRequest({ body: UpdateTaskOrderSchema, params: ColumnParamsSchema }),
  taskController.updateOrder
)

taskRouter.delete(
  '/:taskId',
  validateRequest({ params: TaskParamsSchema }),
  taskController.deleteById
)
