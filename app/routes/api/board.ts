import { Router } from 'express'

import { boardController } from '@/controllers'

import { authenticate, validateRequest } from '@/middlewares'

import { AddBoardSchema, BoardParamsSchema, EditBoardSchema } from '@/schemas'

export const boardRouter = Router()

boardRouter.use(authenticate)

boardRouter.get('/', boardController.getAll)

boardRouter.get(
  '/:boardId',
  validateRequest({ params: BoardParamsSchema }),
  boardController.getById
)

boardRouter.post(
  '/',
  validateRequest({ body: AddBoardSchema }),
  boardController.add
)

boardRouter.put(
  '/:boardId',
  validateRequest({ body: EditBoardSchema, params: BoardParamsSchema }),
  boardController.updateById
)

boardRouter.delete(
  '/:boardId',
  validateRequest({ params: BoardParamsSchema }),
  boardController.deleteById
)
