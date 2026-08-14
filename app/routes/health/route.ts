import { prisma } from '@/prisma'
import { OpenAPIHono } from '@hono/zod-openapi'

import { redisClient } from '@/config'

import { healthRoute } from './openapi'

export const healthRouter = new OpenAPIHono()

const check = async (probe: () => Promise<unknown>) => {
  try {
    await probe()

    return 'up' as const
  } catch {
    return 'down' as const
  }
}

healthRouter.openapi(healthRoute, async c => {
  const [database, redis] = await Promise.all([
    check(() => prisma.$runCommandRaw({ ping: 1 })),
    check(() => redisClient.ping())
  ])

  const isHealthy = database === 'up' && redis === 'up'

  return c.json(
    {
      status: isHealthy ? ('ok' as const) : ('degraded' as const),
      uptime: Math.floor(process.uptime()),
      services: { database, redis }
    },
    isHealthy ? 200 : 503
  )
})
