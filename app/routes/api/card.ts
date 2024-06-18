import { cardController } from '@/controllers/card'
import { AddCardSchema, EditCardSchema } from '@/schemas/card'
import { Router } from 'express'
import { authenticate } from 'middlewares/authenticate'
import { validateRequestBody } from 'zod-express-middleware'

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
