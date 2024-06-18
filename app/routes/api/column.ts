import { columnController } from '@/controllers/column'
import { AddColumnSchema } from '@/schemas/column'
import { Router } from 'express'
import { authenticate } from 'middlewares/authenticate'
import { validateRequestBody } from 'zod-express-middleware'

export const columnRouter = Router()

columnRouter.use(authenticate)

columnRouter.post(
  '/:boardId',
  validateRequestBody(AddColumnSchema),
  columnController.add
)

columnRouter.put('/:columnId', columnController.updateById)

columnRouter.delete('/:columnId', columnController.deleteById)
