import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'

import { env } from '@/config'

import { boardRouter } from './board/route'
import { columnRouter } from './column/route'
import { labelRouter } from './label/route'
import { settingsRouter } from './settings/route'
import { taskRouter } from './task/route'
import { userRouter } from './user/route'

const apiRouter = new OpenAPIHono()

apiRouter.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    version: '2.3.0',
    title: 'Task Pro API',
    description:
      'Task Pro API provides endpoints for managing projects, tasks, and user assignments with secure authentication and efficient workflows.',
    contact: {
      name: 'TaskPro',
      url: 'https://www.taskpro.qzz.io'
    }
  },
  servers: [
    { url: 'http://localhost:9537/api' },
    { url: 'https://api.taskpro.qzz.io' }
  ]
})

apiRouter.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
})

if (env.NODE_ENV === 'development') {
  apiRouter.get(
    '/ui',
    swaggerUI({ title: 'Task Pro API', url: `${env.API_PREFIX}/openapi.json` })
  )
}

apiRouter.route('/user', userRouter)
apiRouter.route('/user/settings', settingsRouter)
apiRouter.route('/board', boardRouter)
apiRouter.route('/column', columnRouter)
apiRouter.route('/task', taskRouter)
apiRouter.route('/label', labelRouter)

export { apiRouter }
