import express from 'express'
import cors from 'cors'
import logger from 'morgan'

import { env } from './config'
import { globalErrorHandler, notFoundHandler } from './middlewares'
import { apiRouter } from './routes'

export const app = express()

app.use(logger(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
app.use(cors({ origin: env.ALLOWED_ORIGINS }))
app.use(express.json())
app.disable('x-powered-by')

app.use(env.API_PREFIX, apiRouter)

app.use(notFoundHandler)
app.use(globalErrorHandler)
