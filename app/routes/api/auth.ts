import { Router } from 'express'

import { authController } from '@/controllers'

import { authenticate, validateRequest } from '@/middlewares'

import { GoogleCodeSchema, SigninSchema, SignupSchema } from '@/schemas'

export const authRouter = Router()

authRouter.post(
  '/signup',
  validateRequest({ body: SignupSchema }),
  authController.signup
)

authRouter.post(
  '/signin',
  validateRequest({ body: SigninSchema }),
  authController.signin
)

authRouter.post('/google/initiate', authController.googleInitiate)

authRouter.get(
  '/google/callback',
  validateRequest({ query: GoogleCodeSchema }),
  authController.googleCallback
)

authRouter.post('/refresh', authController.refresh)

authRouter.post('/logout', authenticate, authController.logout)
