import { createRoute } from '@hono/zod-openapi'

import {
  AvatarSchema,
  BadRequestResponse,
  HelpResponseSchema,
  HelpSchema,
  UnauthorizedResponse,
  UploadAvatarSchema
} from '@/schemas'

export const helpRoute = createRoute({
  method: 'post',
  path: '/help',
  operationId: 'help',
  tags: ['User'],
  summary: 'Send email need help',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: HelpSchema } }
    }
  },
  responses: {
    200: {
      content: { 'application/json': { schema: HelpResponseSchema } },
      description: 'Email sent'
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse
  }
})

export const uploadAvatarRoute = createRoute({
  method: 'post',
  path: '/avatar',
  operationId: 'uploadAvatar',
  tags: ['User'],
  summary: 'Upload user avatar',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { 'multipart/form-data': { schema: UploadAvatarSchema } }
    }
  },
  responses: {
    200: {
      content: { 'application/json': { schema: AvatarSchema } },
      description: 'Avatar uploaded'
    },
    400: BadRequestResponse,
    401: UnauthorizedResponse
  }
})

export const deleteAvatarRoute = createRoute({
  method: 'delete',
  path: '/avatar',
  operationId: 'deleteAvatar',
  tags: ['User'],
  summary: 'Delete user avatar',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: { 'application/json': { schema: AvatarSchema } },
      description: 'Avatar deleted'
    },
    401: UnauthorizedResponse
  }
})
