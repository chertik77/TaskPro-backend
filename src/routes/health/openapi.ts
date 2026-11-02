import { createRoute } from '@hono/zod-openapi'

import { HealthSchema } from '@/schemas'

export const healthRoute = createRoute({
  method: 'get',
  path: '/',
  operationId: 'health',
  tags: ['Health'],
  summary: 'Liveness and readiness probe',
  responses: {
    200: {
      description: 'All dependencies reachable',
      content: { 'application/json': { schema: HealthSchema } }
    },
    503: {
      description: 'One or more dependencies unreachable',
      content: { 'application/json': { schema: HealthSchema } }
    }
  }
})
