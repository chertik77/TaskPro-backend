import { serve } from '@hono/node-server'

import { app } from './app'
import { env, redisClient } from './config'
import { prisma } from './prisma'

console.log('Starting server...')

const server = serve({ fetch: app.fetch, port: env.PORT }, info => {
  console.log(`Server started on port ${info.port}`)
})

const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down...`)

  server.close(async err => {
    if (err) console.error('Error closing server', err)

    await Promise.allSettled([prisma.$disconnect(), redisClient.quit()])

    process.exit(err ? 1 : 0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
