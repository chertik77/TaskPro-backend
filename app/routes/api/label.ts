import { Router } from 'express'

import { labelController } from '@/controllers'

import { authenticate, validateRequest } from '@/middlewares'

import { CreateLabelSchema } from '@/schemas'

export const labelRouter = Router()

labelRouter.use(authenticate)

labelRouter.get('/', labelController.getAll)

labelRouter.post(
  '/',
  validateRequest({ body: CreateLabelSchema }),
  labelController.createLabel
)

labelRouter.patch('/:labelId', labelController.updateById)

labelRouter.delete('/:labelId', labelController.deleteById)
