import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import logger from 'morgan'

import { env } from './config'
import {
  globalErrorHandler,
  globalLimiter,
  notFoundHandler
} from './middlewares'
import { apiRouter } from './routes'

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.ALLOWED_ORIGINS }))
app.use(globalLimiter)
app.use(logger(app.get('env') === 'development' ? 'dev' : 'combined'))
app.use(express.json())

app.use(env.API_PREFIX, apiRouter)

app.use(notFoundHandler)
app.use(globalErrorHandler)
