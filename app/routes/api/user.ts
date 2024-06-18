import { Router } from 'express'
import { validateRequestBody } from 'zod-express-middleware'

import { userController } from 'controllers'

import { authenticate, upload } from 'middlewares'

import { EditUserSchema, NeedHelpSchema, ThemeSchema } from 'schemas/user'

export const userRouter = Router()

userRouter.use(authenticate)

userRouter.put(
  '/',
  upload.single('avatar'),
  validateRequestBody(EditUserSchema),
  userController.update
)

userRouter.post(
  '/help',
  validateRequestBody(NeedHelpSchema),
  userController.help
)

userRouter.put(
  '/theme',
  validateRequestBody(ThemeSchema),
  userController.changeTheme
)

userRouter.get('/me', userController.me)
