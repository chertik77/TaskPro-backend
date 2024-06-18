import { Router } from 'express'
import { validateRequestBody } from 'zod-express-middleware'

import { boardController } from 'controllers'

import { authenticate } from 'middlewares'

import { AddBoardSchema, EditBoardSchema } from 'schemas/board'

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
