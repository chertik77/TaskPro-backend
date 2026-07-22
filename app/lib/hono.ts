import type { Variables } from '@/types'

import { Hono } from 'hono'

import { requireAuth } from '@/middlewares'

export const createProtectedRouter = () => {
  const router = new Hono<{
    Variables: Variables
  }>()

  router.use('*', requireAuth)

  return router
}
