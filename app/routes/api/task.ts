import { Router } from 'express'

import { taskController } from '@/controllers'

import { authenticate, validateRequest } from '@/middlewares'

import {
  AddTaskSchema,
  ColumnParamsSchema,
  EditTaskSchema,
  TaskParamsSchema,
  UpdateTaskOrderSchema
} from '@/schemas'

export const taskRouter = Router()

taskRouter.use(authenticate)

taskRouter.post(
  '/:columnId',
  validateRequest({ body: AddTaskSchema, params: ColumnParamsSchema }),
  taskController.add
)

taskRouter.patch(
  '/:taskId',
  validateRequest({ body: EditTaskSchema, params: TaskParamsSchema }),
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
