import express from 'express'
import swaggerUi from 'swagger-ui-express'

import swaggerDocument from '../../swagger.json'
import { authRouter } from './api/auth'
import { boardRouter } from './api/board'
import { cardRouter } from './api/card'
import { columnRouter } from './api/column'
import { userRouter } from './api/user'

export const apiRouter = express.Router()

apiRouter.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { customSiteTitle: 'TaskPro API Docs' })
)

apiRouter.use('/auth', authRouter)
apiRouter.use('/user', userRouter)
apiRouter.use('/board', boardRouter)
apiRouter.use('/column', columnRouter)
apiRouter.use('/card', cardRouter)
