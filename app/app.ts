import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import logger from 'morgan'

import { env } from './config'
import { globalErrorHandler, notFoundHandler } from './middlewares'
import { apiRouter } from './routes'

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.ALLOWED_ORIGINS, credentials: true }))
// app.use(globalLimiter)
app.use(logger(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
app.use(cookieParser())
app.use(express.json())

app.use(env.API_PREFIX, apiRouter)

app.use(notFoundHandler)
app.use(globalErrorHandler)
