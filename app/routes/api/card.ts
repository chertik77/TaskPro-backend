import { cardController } from '@/controllers/card'
import { AddCardSchema, EditCardSchema } from '@/schemas/card'
import { Router } from 'express'
import { authenticate } from 'middlewares/authenticate'
import { isValidId } from 'middlewares/isValidId'
import { validateRequestBody } from 'zod-express-middleware'

export const cardRouter = Router()

cardRouter.use(authenticate)

cardRouter.post(
  '/:columnId',
  isValidId,
  validateRequestBody(AddCardSchema),
  cardController.add
)

cardRouter.put(
  '/:cardId',
  isValidId,
  validateRequestBody(EditCardSchema),
  cardController.updateById
)

cardRouter.delete('/:cardId', isValidId, cardController.deleteById)

cardRouter.patch(
  '/:cardId/:newColumnId',
  isValidId,
  cardController.changeCardColumn
)
