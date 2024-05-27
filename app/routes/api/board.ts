import { boardController } from '@/controllers/board'
import { Router } from 'express'
import { createValidator } from 'express-joi-validation'
import { authenticate } from 'middlewares/authenticate'
import { isValidId } from 'middlewares/isValidId'
import { addNewBoardSchema, editBoardSchema } from 'schemas/board'

export const boardRouter = Router()

const validator = createValidator()

boardRouter.use(authenticate)

boardRouter.get('/', boardController.getAll)

boardRouter.get('/:boardId', isValidId, boardController.getById)

boardRouter.post('/', validator.body(addNewBoardSchema), boardController.add)

boardRouter.put(
  '/:boardId',
  isValidId,
  validator.body(editBoardSchema),
  boardController.updateById
)

boardRouter.delete('/:boardId', isValidId, boardController.deleteById)
