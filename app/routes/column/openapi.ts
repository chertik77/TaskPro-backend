import { createRoute, z } from '@hono/zod-openapi'

import {
  BadRequestResponse,
  BoardParamsSchema,
  ColumnParamsSchema,
  ColumnSchema,
  CreateColumnSchema,
  NotFoundResponse,
  UnauthorizedResponse,
  UpdateColumnSchema,
  UpdateColumnsOrderSchema
} from '@/schemas'

export const createColumnRoute = createRoute({
  method: 'post',
  path: '/{boardId}',
  operationId: 'createColumn',
  tags: ['Column'],
  summary: 'Create new column',
  security: [{ bearerAuth: [] }],
  request: {
    params: BoardParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: CreateColumnSchema } }
    }
  },
  responses: {
    201: {
      description: 'Success',
      content: {
        'application/json': { schema: ColumnSchema.omit({ tasks: true }) }
      }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})

export const updateColumnsOrderRoute = createRoute({
  method: 'patch',
  path: '/{boardId}/order',
  operationId: 'updateColumnsOrder',
  tags: ['Column'],
  summary: 'Update columns order',
  security: [{ bearerAuth: [] }],
  request: {
    params: BoardParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateColumnsOrderSchema } }
    }
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: z.array(ColumnSchema.omit({ tasks: true }))
        }
      }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})

export const updateColumnRoute = createRoute({
  method: 'patch',
  path: '/{columnId}',
  operationId: 'updateColumn',
  tags: ['Column'],
  summary: 'Update column by id',
  security: [{ bearerAuth: [] }],
  request: {
    params: ColumnParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateColumnSchema } }
    }
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: ColumnSchema.omit({ tasks: true }) }
      }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})

export const deleteColumnRoute = createRoute({
  method: 'delete',
  path: '/{columnId}',
  operationId: 'deleteColumn',
  tags: ['Column'],
  summary: 'Delete column by id',
  security: [{ bearerAuth: [] }],
  request: { params: ColumnParamsSchema },
  responses: {
    204: { description: 'The resource was deleted successfully.' },
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})
