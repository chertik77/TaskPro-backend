import type { RedisReply } from 'rate-limit-redis'

import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

import { redisClient } from '@/config'

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redisClient.call(command, ...args) as Promise<RedisReply>
  })
})
