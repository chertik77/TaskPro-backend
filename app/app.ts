import cors from 'cors'
import 'dotenv/config'
import express, {
  type NextFunction,
  type Request,
  type Response
} from 'express'
import logger from 'morgan'

import { authRouter } from './routes/api/auth'
import { moviesRouter } from './routes/api/movies-router'

export type CustomError = Error & {
  status: number
  code: number
}

export const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',')

app.use(logger(formatsLogger))
app.use(
  cors({
    origin: (origin, cb) => {
      allowedOrigins?.indexOf(origin as string) !== -1
        ? cb(null, true)
        : cb(new Error('Not allowed by CORS'))
    }
  })
)

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/movies', moviesRouter)

app.use((_: Request, res: Response) => {
  res.status(404).json({ message: 'Not foundd' })
})

app.use(
  (err: CustomError, _: Request, res: Response, __: NextFunction): void => {
    const { status = 500, message = 'Server error' } = err
    res.status(status).json({ message })
  }
)
