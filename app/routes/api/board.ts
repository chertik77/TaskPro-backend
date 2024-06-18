import { boardController } from '@/controllers/board'
import { Router } from 'express'
import { authenticate } from 'middlewares/authenticate'
import { isValidId } from 'middlewares/isValidId'
import { AddBoardSchema, EditBoardSchema } from 'schemas/board'
import { validateRequestBody } from 'zod-express-middleware'

export const boardRouter = Router()

boardRouter.use(authenticate)

boardRouter.get('/', boardController.getAll)

boardRouter.get('/:boardId', isValidId, boardController.getById)

boardRouter.post('/', validateRequestBody(AddBoardSchema), boardController.add)

boardRouter.put(
  '/:boardId',
  isValidId,
  validateRequestBody(EditBoardSchema),
  boardController.updateById
)

boardRouter.delete('/:boardId', isValidId, boardController.deleteById)
