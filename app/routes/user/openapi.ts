import { createRoute } from '@hono/zod-openapi'

import {
  BadRequestResponse,
  HelpResponseSchema,
  HelpSchema,
  UnauthorizedResponse
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
