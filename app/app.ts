import express from 'express'
import { toNodeHandler } from 'better-auth/node'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import logger from 'morgan'
import * as z from 'zod'

import { env, zodConfig } from './config'
import { auth } from './lib'
import { globalErrorHandler, notFoundHandler } from './middlewares'
import { apiRouter } from './routes'

export const app = express()

z.config(zodConfig)

app.use(cors({ origin: env.ALLOWED_ORIGINS, credentials: true }))

app.all(`${env.API_PREFIX}/auth/*splat`, toNodeHandler(auth))

app.use(helmet())
app.use(logger(app.get('env') === 'development' ? 'dev' : 'combined'))
app.use(cookieParser())
app.use(express.json())

app.use(env.API_PREFIX, apiRouter)

app.use(notFoundHandler)
app.use(globalErrorHandler)
