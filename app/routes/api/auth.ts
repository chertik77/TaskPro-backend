import { Router } from 'express'

import { authController } from '@/controllers'

import { authenticate, validateRequest } from '@/middlewares'

import {
  GoogleAuthSchema,
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

authRouter.post(
  '/google',
  validateRequest({ body: GoogleAuthSchema }),
  authController.google
)

authRouter.post(
  '/tokens',
  validateRequest({ body: RefreshTokenSchema }),
  authController.tokens
)

authRouter.post('/logout', authenticate, authController.logout)
