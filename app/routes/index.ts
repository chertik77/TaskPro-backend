import fs from 'fs'
import path from 'path'

import { swaggerUI } from '@hono/swagger-ui'
import { Hono } from 'hono'

import { env } from '@/config'

import { boardRouter } from './board'
import { columnRouter } from './column'
import { labelRouter } from './label'
import { settingsRouter } from './settings'
import { taskRouter } from './task'
import { userRouter } from './user'

const apiRouter = new Hono()

const swaggerPath = path.join(process.cwd(), 'openapi.json')
const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))

apiRouter.get('/doc', c => c.json(swagger))
apiRouter.get(
  '/ui',
  swaggerUI({
    // url: `${env.API_PREFIX}/doc`,
    title: 'TaskPro API Docs',
    urls: [
      { url: `${env.API_PREFIX}/auth/open-api/generate-schema`, name: 'Auth' },
      { url: `${env.API_PREFIX}/doc`, name: 'Main API' }
    ]
  })
)

apiRouter.route('/user', userRouter)
apiRouter.route('/user/settings', settingsRouter)
apiRouter.route('/board', boardRouter)
apiRouter.route('/column', columnRouter)
apiRouter.route('/task', taskRouter)
apiRouter.route('/label', labelRouter)

export { apiRouter }
