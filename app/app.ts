import express from 'express'

import { env } from './config'
import {
  globalErrorHandler,
  notFoundHandler,
  setupCommonMiddleware,
  setupPassportMiddleware,
  setupSessionMiddleware
} from './middlewares'
import { apiRouter } from './routes'

export const app = express()

setupCommonMiddleware(app)
setupSessionMiddleware(app)
setupPassportMiddleware(app)

app.use(env.API_PREFIX, apiRouter)

app.use(notFoundHandler)
app.use(globalErrorHandler)
