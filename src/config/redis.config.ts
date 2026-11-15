import { Redis } from 'ioredis'

import { env } from './env.config'

export const redisClient = new Redis(env.REDIS_URL)

redisClient.on('error', err => console.error('[redis]', err.message))
