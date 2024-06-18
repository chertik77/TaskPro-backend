import { Router } from 'express'
import { validateRequestBody } from 'zod-express-middleware'

import { columnController } from 'controllers'

import { authenticate } from 'middlewares'

import { AddColumnSchema } from 'schemas/column'

export const columnRouter = Router()

columnRouter.use(authenticate)

columnRouter.post(
  '/:boardId',
  validateRequestBody(AddColumnSchema),
  columnController.add
)

columnRouter.put('/:columnId', columnController.updateById)

columnRouter.delete('/:columnId', columnController.deleteById)
