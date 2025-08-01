import { Router } from 'express'

import { authController } from '@/controllers'

import { authenticate } from '@/middlewares'
import { validateRequest } from '@/middlewares/validate-request'

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

authRouter.post('/google/redirect', authController.googleRedirect)

authRouter.get(
  '/google/callback',
  validateRequest({ query: GoogleCodeSchema }),
  authController.googleCallback
)

authRouter.post('/refresh', authController.refresh)

authRouter.post('/logout', authenticate, authController.logout)
