import fs from 'fs'
import path from 'path'

import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'

import { authRouter } from './api/auth'
import { boardRouter } from './api/board'
import { cardRouter } from './api/card'
import { columnRouter } from './api/column'
import { userRouter } from './api/user'

export const apiRouter = Router()

const swaggerPath = path.join(process.cwd(), 'swagger.json')
const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))

apiRouter.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swagger, { customSiteTitle: 'TaskPro API Docs' })
)

apiRouter.use('/auth', authRouter)
apiRouter.use('/user', userRouter)
apiRouter.use('/board', boardRouter)
apiRouter.use('/column', columnRouter)
apiRouter.use('/card', cardRouter)
