import { Router } from 'express'
import { validateRequestBody } from 'zod-express-middleware'

import { cardController } from 'controllers'

import { authenticate } from 'middlewares'

import { AddCardSchema, EditCardSchema } from 'schemas/card'

export const cardRouter = Router()

cardRouter.use(authenticate)

cardRouter.post(
  '/:columnId',
  validateRequestBody(AddCardSchema),
  cardController.add
)

cardRouter.put(
  '/:cardId',
  validateRequestBody(EditCardSchema),
  cardController.updateById
)

cardRouter.delete('/:cardId', cardController.deleteById)

cardRouter.patch('/:cardId/:newColumnId', cardController.changeCardColumn)
