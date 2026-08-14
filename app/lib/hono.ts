import type { AuthVariables } from '@/types'

import { OpenAPIHono } from '@hono/zod-openapi'

import { requireAuth } from '@/middlewares'

export const createProtectedRouter = () => {
  const router = new OpenAPIHono<{
    Variables: AuthVariables
  }>()

  router.use('*', requireAuth)

  return router
}
