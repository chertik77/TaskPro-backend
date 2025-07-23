import type { Application } from 'express'

import { json } from 'express'
import cors from 'cors'
import logger from 'morgan'

import { env } from '../config'

export const setupCommonMiddleware = (app: Application) => {
  app.use(logger(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
  app.use(cors({ origin: env.ALLOWED_ORIGINS, credentials: true }))
  app.use(json())
  app.disable('x-powered-by')
}
