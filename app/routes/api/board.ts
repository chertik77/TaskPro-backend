import { boardController } from '@/controllers/board'
import { Router } from 'express'
import { authenticate } from 'middlewares/authenticate'
import { AddBoardSchema, EditBoardSchema } from 'schemas/board'
import { validateRequestBody } from 'zod-express-middleware'

export const boardRouter = Router()

boardRouter.use(authenticate)

boardRouter.get('/', boardController.getAll)

boardRouter.get('/:boardId', boardController.getById)

boardRouter.post('/', validateRequestBody(AddBoardSchema), boardController.add)

boardRouter.put(
  '/:boardId',
  validateRequestBody(EditBoardSchema),
  boardController.updateById
)

boardRouter.delete('/:boardId', boardController.deleteById)
