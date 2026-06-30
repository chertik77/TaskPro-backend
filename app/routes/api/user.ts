import { Router } from 'express'

import { userController } from '@/controllers'

import { requireAuth, validateRequest } from '@/middlewares'

import { NeedHelpSchema } from '@/schemas'

export const userRouter = Router()

userRouter.use(requireAuth)

userRouter.get('/me', userController.me)

// userRouter.patch(
//   '/',
//   upload.single('avatar'),
//   validateRequest({ body: EditUserSchema }),
//   userController.update
// )

userRouter.post(
  '/help',
  validateRequest({ body: NeedHelpSchema }),
  userController.help
)
