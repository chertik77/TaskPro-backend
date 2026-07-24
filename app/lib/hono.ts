import type { Variables } from '@/types'

import { OpenAPIHono } from '@hono/zod-openapi'

import { requireAuth } from '@/middlewares'

export const createProtectedRouter = () => {
  const router = new OpenAPIHono<{
    Variables: Variables
  }>()

  router.use('*', requireAuth)

  return router
}
