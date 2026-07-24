import type { AuthVariables } from './types'

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import z from 'zod'

import { env, zodConfig } from './config'
import { auth } from './lib'
import { apiRouter } from './routes'

export const app = new Hono<{ Variables: AuthVariables }>()

z.config(zodConfig)

app.use('*', logger())
app.use('*', secureHeaders())

app.use('*', cors({ origin: env.ALLOWED_ORIGINS, credentials: true }))

app.on(['GET', 'POST'], `${env.API_PREFIX}/auth/*`, c =>
  auth.handler(c.req.raw)
)

app.route(env.API_PREFIX, apiRouter)

app.notFound(c => c.json({ status: 404, message: 'Not found' }, 404))

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse()

  console.error(err)

  return c.json(
    {
      status: err instanceof HTTPException ? err.status : 500,
      message: err.message || 'Server error'
    },
    err instanceof HTTPException ? err.status : 500
  )
})
