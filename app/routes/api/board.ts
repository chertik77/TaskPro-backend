import { Router } from 'express'

import { boardController } from '@/controllers'

import { requireAuth, validateRequest } from '@/middlewares'

import {
  BoardParamsSchema,
  CreateBoardSchema,
  UpdateBoardSchema
} from '@/schemas'

export const boardRouter = Router()

boardRouter.use(requireAuth)

boardRouter.get('/', boardController.getAll)

boardRouter.get(
  '/:boardId',
  validateRequest({ params: BoardParamsSchema }),
  boardController.getById
)

boardRouter.post(
  '/',
  validateRequest({ body: CreateBoardSchema }),
  boardController.create
)

boardRouter.patch(
  '/:boardId',
  validateRequest({ body: UpdateBoardSchema, params: BoardParamsSchema }),
  boardController.updateById
)

boardRouter.delete(
  '/:boardId',
  validateRequest({ params: BoardParamsSchema }),
  boardController.deleteById
)
