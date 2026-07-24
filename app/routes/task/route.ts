import { createProtectedRouter } from '@/lib'
import { taskService } from '@/services'

import {
  createTaskRoute,
  deleteTaskRoute,
  updateTaskRoute,
  updateTasksOrderRoute
} from './openapi'

export const taskRouter = createProtectedRouter()

taskRouter.openapi(createTaskRoute, async c => {
  const json = c.req.valid('json')
  const { columnId } = c.req.valid('param')
  const user = c.get('user')

  const task = await taskService.create(json, columnId, user.id)

  return c.json(task, 201)
})

taskRouter.openapi(updateTaskRoute, async c => {
  const json = c.req.valid('json')
  const { taskId } = c.req.valid('param')
  const user = c.get('user')

  const task = await taskService.updateById(json, taskId, user.id)

  return c.json(task, 200)
})

taskRouter.openapi(updateTasksOrderRoute, async c => {
  const { columnId } = c.req.valid('param')
  const json = c.req.valid('json')
  const user = c.get('user')

  const tasks = await taskService.updateOrder(json, columnId, user.id)

  return c.json(tasks, 200)
})

taskRouter.openapi(deleteTaskRoute, async c => {
  const { taskId } = c.req.valid('param')
  const user = c.get('user')

  await taskService.deleteById(taskId, user.id)

  return c.body(null, 204)
})
