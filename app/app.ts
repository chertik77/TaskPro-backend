import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import logger from 'morgan'
import * as z from 'zod'

import { env, zodConfig } from './config'
import { globalErrorHandler, notFoundHandler } from './middlewares'
import { apiRouter } from './routes'

export const app = express()

z.config(zodConfig)

app.use(helmet())
app.use(cors({ origin: env.ALLOWED_ORIGINS }))
app.use(logger(app.get('env') === 'development' ? 'dev' : 'combined'))
app.use(express.json())

app.use(env.API_PREFIX, apiRouter)

app.use(notFoundHandler)
app.use(globalErrorHandler)
