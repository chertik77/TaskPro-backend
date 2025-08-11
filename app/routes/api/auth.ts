import { Router } from 'express'

import { authController } from '@/controllers'

import { authenticate, validateRequest } from '@/middlewares'

import {
  GoogleCodeSchema,
  RefreshTokenSchema,
  SigninSchema,
  SignupSchema
} from '@/schemas'

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

authRouter.get('/google/initiate', authController.getGoogleRedirectUrl)

authRouter.post(
  '/google/callback',
  validateRequest({ body: GoogleCodeSchema }),
  authController.googleCallback
)

authRouter.post(
  '/refresh',
  validateRequest({ body: RefreshTokenSchema }),
  authController.refresh
)

authRouter.post('/logout', authenticate, authController.logout)
