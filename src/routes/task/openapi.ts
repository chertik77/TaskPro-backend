import { createRoute } from '@hono/zod-openapi'

import {
  BadRequestResponse,
  ColumnParamsSchema,
  CreateTaskSchema,
  MoveTaskSchema,
  NotFoundResponse,
  TaskParamsSchema,
  TaskSchema,
  UnauthorizedResponse,
  UpdateTaskSchema,
  UpdateTasksOrderSchema
} from '@/schemas'

export const createTaskRoute = createRoute({
  method: 'post',
  path: '/{columnId}',
  operationId: 'createTask',
  tags: ['Task'],
  summary: 'Create new task',
  security: [{ cookieAuth: [] }],
  request: {
    params: ColumnParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: CreateTaskSchema } }
    }
  },
  responses: {
    201: {
      description: 'Success',
      content: { 'application/json': { schema: TaskSchema } }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})

export const moveTaskRoute = createRoute({
  method: 'patch',
  path: '/{taskId}/move',
  operationId: 'moveTask',
  tags: ['Task'],
  summary: 'Move a task between or within columns',
  description:
    'Repositions a single task relative to its new neighbours. Costs one write regardless of column size.',
  security: [{ cookieAuth: [] }],
  request: {
    params: TaskParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: MoveTaskSchema } }
    }
  },
  responses: {
    200: {
      description: 'Moved',
      content: { 'application/json': { schema: TaskSchema } }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})

export const updateTasksOrderRoute = createRoute({
  method: 'patch',
  path: '/{columnId}/order',
  operationId: 'updateTasksOrder',
  tags: ['Task'],
  summary: 'Rewrite the full task order of a column',
  security: [{ cookieAuth: [] }],
  request: {
    params: ColumnParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateTasksOrderSchema } }
    }
  },
  responses: {
    204: { description: 'The order was updated successfully.' },
    400: BadRequestResponse,
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})

export const updateTaskRoute = createRoute({
  method: 'patch',
  path: '/{taskId}',
  operationId: 'updateTask',
  tags: ['Task'],
  summary: 'Update task by id',
  security: [{ cookieAuth: [] }],
  request: {
    params: TaskParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateTaskSchema } }
    }
  },
  responses: {
    200: {
      description: 'Success',
      content: { 'application/json': { schema: TaskSchema } }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})

export const deleteTaskRoute = createRoute({
  method: 'delete',
  path: '/{taskId}',
  operationId: 'deleteTask',
  tags: ['Task'],
  summary: 'Delete task by id',
  security: [{ cookieAuth: [] }],
  request: { params: TaskParamsSchema },
  responses: {
    204: { description: 'The resource was deleted successfully.' },
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})
