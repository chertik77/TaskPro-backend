import { Router } from 'express'

import { userController } from '@/controllers'

import { authenticate, upload, validateRequest } from '@/middlewares'

import { EditUserSchema, NeedHelpSchema } from '@/schemas'

export const userRouter = Router()

userRouter.use(authenticate)

userRouter.get('/me', userController.me)

userRouter.patch(
  '/',
  upload.single('avatar'),
  validateRequest({ body: EditUserSchema }),
  userController.update
)

userRouter.post(
  '/help',
  validateRequest({ body: NeedHelpSchema }),
  userController.help
)
