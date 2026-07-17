import fs from 'fs'
import path from 'path'
import type { SwaggerUiOptions } from 'swagger-ui-express'

import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'

import { env } from '@/config'

import { boardRouter } from './api/board'
import { columnRouter } from './api/column'
import { labelRouter } from './api/label'
import { settingsRouter } from './api/settings'
import { taskRouter } from './api/task'
import { userRouter } from './api/user'

export const apiRouter = Router()

const swaggerPath = path.join(process.cwd(), 'openapi.json')
const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))

apiRouter.get('/openapi.json', (_, res) => {
  res.json(swagger)
})

const swaggerOptions: SwaggerUiOptions = {
  customSiteTitle: 'TaskPro API Docs',
  explorer: true,
  swaggerOptions: {
    urls: [
      { url: `${env.API_PREFIX}/openapi.json`, name: 'Main API' },
      { url: `${env.API_PREFIX}/auth/open-api/generate-schema`, name: 'Auth' }
    ],
    'urls.primaryName': 'Main API'
  }
}

apiRouter.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swagger, swaggerOptions)
)

apiRouter.use('/user', userRouter)
apiRouter.use('/board', boardRouter)
apiRouter.use('/column', columnRouter)
apiRouter.use('/task', taskRouter)
apiRouter.use('/label', labelRouter)
apiRouter.use('/user/settings', settingsRouter)
