import { z } from '@hono/zod-openapi'

const ServiceStatusSchema = z.enum(['up', 'down'])

export const HealthSchema = z
  .object({
    status: z.enum(['ok', 'degraded']).openapi({ example: 'ok' }),
    uptime: z
      .number()
      .int()
      .openapi({ description: 'Process uptime in seconds', example: 3600 }),
    services: z.object({
      database: ServiceStatusSchema.openapi({ example: 'up' }),
      redis: ServiceStatusSchema.openapi({ example: 'up' })
    })
  })
  .openapi('Health')
