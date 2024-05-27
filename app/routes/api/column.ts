import { columnController } from '@/controllers/column'
import { addColumnSchema } from '@/schemas/column'
import { Router } from 'express'
import { createValidator } from 'express-joi-validation'
import { authenticate } from 'middlewares/authenticate'
import { isValidId } from 'middlewares/isValidId'

export const columnRouter = Router()

const validator = createValidator()

columnRouter.use(authenticate)

columnRouter.post(
  '/:boardId',
  validator.body(addColumnSchema),
  columnController.add
)

columnRouter.put('/:columnId', isValidId, columnController.updateById)

columnRouter.delete('/:columnId', isValidId, columnController.deleteById)
