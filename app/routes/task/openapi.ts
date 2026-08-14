import { createRoute, z } from '@hono/zod-openapi'

import {
  BadRequestResponse,
  ColumnParamsSchema,
  CreateTaskSchema,
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
  security: [{ bearerAuth: [] }],
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

export const updateTasksOrderRoute = createRoute({
  method: 'patch',
  path: '/{columnId}/order',
  operationId: 'updateTasksOrder',
  tags: ['Task'],
  summary: 'Update tasks order',
  security: [{ bearerAuth: [] }],
  request: {
    params: ColumnParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateTasksOrderSchema } }
    }
  },
  responses: {
    200: {
      description: 'Updated',
      content: {
        'application/json': {
          schema: z.array(TaskSchema.omit({ labels: true }))
        }
      }
    },
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
  security: [{ bearerAuth: [] }],
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
  security: [{ bearerAuth: [] }],
  request: { params: TaskParamsSchema },
  responses: {
    204: { description: 'The resource was deleted successfully.' },
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})
