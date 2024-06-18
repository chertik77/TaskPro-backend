import { columnController } from '@/controllers/column'
import { AddColumnSchema } from '@/schemas/column'
import { Router } from 'express'
import { createValidator } from 'express-joi-validation'
import { authenticate } from 'middlewares/authenticate'
import { isValidId } from 'middlewares/isValidId'
import { validateRequestBody } from 'zod-express-middleware'

export const columnRouter = Router()

const validator = createValidator()

columnRouter.use(authenticate)

columnRouter.post(
  '/:boardId',
  validateRequestBody(AddColumnSchema),
  columnController.add
)

columnRouter.put('/:columnId', isValidId, columnController.updateById)

columnRouter.delete('/:columnId', isValidId, columnController.deleteById)
