import Redis from 'ioredis'

import { env } from './env.config'

export const redis = new Redis({
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
  host: env.REDIS_HOST,
  port: env.REDIS_PORT
})
