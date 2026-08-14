import { createRoute, z } from '@hono/zod-openapi'

import {
  BadRequestResponse,
  BoardParamsSchema,
  BoardSchema,
  CreateBoardSchema,
  NotFoundResponse,
  UnauthorizedResponse,
  UpdateBoardSchema
} from '@/schemas'

export const getAllBoardsRoute = createRoute({
  method: 'get',
  path: '/',
  operationId: 'getAllBoards',
  tags: ['Board'],
  summary: 'Get all boards',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: z.array(BoardSchema.omit({ columns: true }))
        }
      }
    },
    401: UnauthorizedResponse
  }
})

export const createBoardRoute = createRoute({
  method: 'post',
  path: '/',
  operationId: 'createBoard',
  tags: ['Board'],
  summary: 'Create new board',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: CreateBoardSchema } }
    }
  },
  responses: {
    201: {
      description: 'Success',
      content: { 'application/json': { schema: BoardSchema } }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse
  }
})

export const getBoardByIdRoute = createRoute({
  method: 'get',
  path: '/{boardId}',
  operationId: 'getBoardById',
  tags: ['Board'],
  summary: 'Get board by id',
  security: [{ bearerAuth: [] }],
  request: { params: BoardParamsSchema },
  responses: {
    200: {
      description: 'Success',
      content: { 'application/json': { schema: BoardSchema } }
    },
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})

export const updateBoardRoute = createRoute({
  method: 'patch',
  path: '/{boardId}',
  operationId: 'updateBoard',
  tags: ['Board'],
  summary: 'Update board by id',
  security: [{ bearerAuth: [] }],
  request: {
    params: BoardParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateBoardSchema } }
    }
  },
  responses: {
    200: {
      description: 'Success',
      content: { 'application/json': { schema: BoardSchema } }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})

export const deleteBoardRoute = createRoute({
  method: 'delete',
  path: '/{boardId}',
  operationId: 'deleteBoard',
  tags: ['Board'],
  summary: 'Delete board by id',
  security: [{ bearerAuth: [] }],
  request: { params: BoardParamsSchema },
  responses: {
    204: { description: 'The resource was deleted successfully.' },
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})
