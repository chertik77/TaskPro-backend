import { createRoute } from '@hono/zod-openapi'

import {
  BadRequestResponse,
  GeneralSettingsSchema,
  LabelSettingsSchema,
  TaskSettingsSchema,
  UnauthorizedResponse,
  UpdateGeneralSettingsSchema,
  UpdateLabelSettingsSchema,
  UpdateTaskSettingsSchema,
  UserSettingsSchema
} from '@/schemas'

export const getAllSettingsRoute = createRoute({
  method: 'get',
  path: '/',
  operationId: 'getAllSettings',
  tags: ['User'],
  summary: 'Get all user settings',
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Success',
      content: { 'application/json': { schema: UserSettingsSchema } }
    },
    401: UnauthorizedResponse
  }
})

export const updateGeneralSettingsRoute = createRoute({
  method: 'patch',
  path: '/general',
  operationId: 'updateGeneralSettings',
  tags: ['User'],
  summary: 'Update general settings',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateGeneralSettingsSchema } }
    }
  },
  responses: {
    200: {
      description: 'Updated',
      content: { 'application/json': { schema: GeneralSettingsSchema } }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse
  }
})

export const updateTaskSettingsRoute = createRoute({
  method: 'patch',
  path: '/task',
  operationId: 'updateTaskSettings',
  tags: ['User'],
  summary: 'Update task settings',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateTaskSettingsSchema } }
    }
  },
  responses: {
    200: {
      description: 'Updated',
      content: { 'application/json': { schema: TaskSettingsSchema } }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse
  }
})

export const updateLabelSettingsRoute = createRoute({
  method: 'patch',
  path: '/label',
  operationId: 'updateLabelSettings',
  tags: ['User'],
  summary: 'Update label settings',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateLabelSettingsSchema } }
    }
  },
  responses: {
    200: {
      description: 'Updated',
      content: { 'application/json': { schema: LabelSettingsSchema } }
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse
  }
})
