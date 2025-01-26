import { Router } from 'express'

import { userController } from '@/controllers'

import { authenticate, upload, validateRequest } from '@/middlewares'

import { EditUserSchema, NeedHelpSchema, ThemeSchema } from '@/utils/schemas'

export const userRouter = Router()

userRouter.use(authenticate)

userRouter.put(
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

userRouter.put(
  '/theme',
  validateRequest({ body: ThemeSchema }),
  userController.updateTheme
)
