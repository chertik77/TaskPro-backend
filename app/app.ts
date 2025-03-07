import type { NextFunction, Request, Response } from 'express'
import type { HttpError } from 'http-errors'

import express from 'express'
import cors from 'cors'
import logger from 'morgan'
import swaggerUi from 'swagger-ui-express'

import 'dotenv/config'

import swaggerDocument from '../swagger.json'
import {
  authRouter,
  boardRouter,
  cardRouter,
  columnRouter,
  userRouter
} from './routes/api'

export const app = express()

const appRouter = express.Router()

app.use(logger('dev'))
app.use(cors())
app.use(express.json())
app.disable('x-powered-by')

appRouter.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { customSiteTitle: 'TaskPro API Docs' })
)
appRouter.use('/auth', authRouter)
appRouter.use('/user', userRouter)
appRouter.use('/board', boardRouter)
appRouter.use('/column', columnRouter)
appRouter.use('/card', cardRouter)

app.use(process.env.API_PREFIX!, appRouter)

app.use((_, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err: HttpError, _: Request, res: Response, __: NextFunction) => {
  const { status = 500, message = 'Server error' } = err
  res.status(status).json({ statusCode: status, message })
})
