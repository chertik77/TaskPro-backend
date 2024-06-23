import type { NextFunction, Request, Response } from 'express'

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
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

export type ResponseError = Error & {
  status?: number
  code?: number | string
}

export const app = express()

app.use(logger('dev'))
app.use(cors({ origin: process.env.ALLOWED_ORIGINS.split(',') }))
app.use(express.json())
app.disable('x-powered-by')

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/board', boardRouter)
app.use('/api/column', columnRouter)
app.use('/api/card', cardRouter)

app.use((_, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err: ResponseError, _: Request, res: Response, __: NextFunction) => {
  const { status = 500, message = 'Server error' } = err
  res.status(status).json({ message })
})

mongoose.set('toJSON', {
  virtuals: true,
  transform(_, ret) {
    if (ret.password) delete ret.password

    if (ret.avatar) ret.avatar = ret.avatar.url

    delete ret._id
  }
})
