import { createRoute, z } from '@hono/zod-openapi'

import {
  BadRequestResponse,
  NotFoundResponse,
  UnauthorizedResponse
} from '@/schemas'
import {
  CreateLabelSchema,
  LabelConflictResponse,
  LabelParamsSchema,
  LabelSchema,
  UpdateLabelSchema
} from '@/schemas/label.schema'

export const getAllLabelsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Label'],
  operationId: 'getAllLabels',
  summary: 'Get all labels',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Success',
      content: { 'application/json': { schema: z.array(LabelSchema) } }
    },
    401: UnauthorizedResponse
  }
})

export const createLabelRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Label'],
  operationId: 'createLabel',
  summary: 'Create new label',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: CreateLabelSchema } }
    }
  },
  responses: {
    201: {
      description: 'Success',
      content: { 'application/json': { schema: LabelSchema } }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse,
    409: LabelConflictResponse
  }
})

export const updateLabelRoute = createRoute({
  method: 'patch',
  path: '/{labelId}',
  tags: ['Label'],
  operationId: 'updateLabel',
  summary: 'Update label by id',
  security: [{ bearerAuth: [] }],
  request: {
    params: LabelParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateLabelSchema } }
    }
  },
  responses: {
    200: {
      description: 'Success',
      content: { 'application/json': { schema: LabelSchema } }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse,
    404: NotFoundResponse,
    409: LabelConflictResponse
  }
})

export const deleteLabelRoute = createRoute({
  method: 'delete',
  path: '/{labelId}',
  tags: ['Label'],
  operationId: 'deleteLabel',
  summary: 'Delete label by id',
  security: [{ bearerAuth: [] }],
  request: { params: LabelParamsSchema },
  responses: {
    204: { description: 'The resource was deleted successfully.' },
    401: UnauthorizedResponse,
    404: NotFoundResponse
  }
})
