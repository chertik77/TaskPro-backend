import { createProtectedRouter } from '@/lib'
import { taskService } from '@/services'

import { zValidator } from '@/middlewares'

import {
  ColumnParamsSchema,
  CreateTaskSchema,
  TaskParamsSchema,
  UpdateTaskOrderSchema,
  UpdateTaskSchema
} from '@/schemas'

export const taskRouter = createProtectedRouter()

taskRouter.post(
  '/:columnId',
  zValidator('param', ColumnParamsSchema),
  zValidator('json', CreateTaskSchema),
  async c => {
    const json = c.req.valid('json')
    const { columnId } = c.req.valid('param')
    const user = c.get('user')

    const task = await taskService.create(json, columnId, user.id)

    return c.json(task)
  }
)

taskRouter.patch(
  '/:taskId',
  zValidator('param', TaskParamsSchema),
  zValidator('json', UpdateTaskSchema),
  async c => {
    const json = c.req.valid('json')
    const { taskId } = c.req.valid('param')
    const user = c.get('user')

    const task = await taskService.updateById(json, taskId, user.id)

    return c.json(task)
  }
)

taskRouter.patch(
  '/:columnId/order',
  zValidator('param', ColumnParamsSchema),
  zValidator('json', UpdateTaskOrderSchema),
  async c => {
    const { columnId } = c.req.valid('param')
    const json = c.req.valid('json')
    const user = c.get('user')

    const tasks = await taskService.updateOrder(json, columnId, user.id)

    return c.json(tasks)
  }
)

taskRouter.delete(
  '/:taskId',
  zValidator('param', TaskParamsSchema),
  async c => {
    const { taskId } = c.req.valid('param')
    const user = c.get('user')

    await taskService.deleteById(taskId, user.id)

    return c.status(204)
  }
)
