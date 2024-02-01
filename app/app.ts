import cors from 'cors'
import 'dotenv/config'
import express, {
  type NextFunction,
  type Request,
  type Response
} from 'express'
import logger from 'morgan'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../swagger.json'

import { authRouter } from './routes/api/auth'
import { moviesRouter } from './routes/api/movies-router'

export type CustomError = Error & {
  status: number
  code: number
}

export const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api/auth', authRouter)
app.use('/api/movies', moviesRouter)

app.use((_: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' })
})

app.use(
  (err: CustomError, _: Request, res: Response, __: NextFunction): void => {
    const { status = 500, message = 'Server error' } = err
    res.status(status).json({ message })
  }
)
