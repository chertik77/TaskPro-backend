import type { NextFunction, Request, Response } from 'express'

import express from 'express'
import cors from 'cors'
import logger from 'morgan'
import swaggerUi from 'swagger-ui-express'

import 'dotenv/config'

import { PrismaClient } from '@prisma/client'

import swaggerDocument from '../swagger.json'
import {
  authRouter,
  boardRouter,
  cardRouter,
  columnRouter,
  userRouter
} from './routes/api'

export type ResponseError = Error & {
  status?: number
  code?: number | string
}

const app = express()

export const prisma = new PrismaClient()

app.listen(Number(process.env.PORT) || 5432, () => {
  console.log(`Server started on port ${process.env.PORT || 5432}`)
})

const appRouter = express.Router()

app.use(logger('dev'))
app.use(cors({ origin: process.env.ALLOWED_ORIGINS }))
app.use(express.json())
app.disable('x-powered-by')

appRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
appRouter.use('/auth', authRouter)
appRouter.use('/user', userRouter)
appRouter.use('/board', boardRouter)
appRouter.use('/column', columnRouter)
appRouter.use('/card', cardRouter)

app.use(process.env.API_PREFIX!, appRouter)

app.use((_, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err: ResponseError, _: Request, res: Response, __: NextFunction) => {
  const { status = 500, message = 'Server error' } = err
  res.status(status).json({ message })
})
