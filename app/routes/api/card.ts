import { cardController } from '@/controllers/card'
import { addNewCardSchema, editCardSchema } from '@/schemas/card'
import { Router } from 'express'
import { createValidator } from 'express-joi-validation'
import { authenticate } from 'middlewares/authenticate'
import { isValidId } from 'middlewares/isValidId'

export const cardRouter = Router()

const validator = createValidator()

cardRouter.use(authenticate)

cardRouter.post(
  '/:columnId',
  isValidId,
  validator.body(addNewCardSchema),
  cardController.add
)

cardRouter.put(
  '/:cardId',
  isValidId,
  validator.body(editCardSchema),
  cardController.updateById
)

cardRouter.delete('/:cardId', isValidId, cardController.deleteById)

cardRouter.patch(
  '/:cardId/:newColumnId',
  isValidId,
  cardController.changeCardColumn
)
