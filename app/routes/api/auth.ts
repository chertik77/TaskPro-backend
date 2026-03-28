import { Router } from 'express'

import { authController } from '@/controllers'

import { authenticate, validateRequest } from '@/middlewares'

import { SigninSchema, SignupSchema } from '@/schemas'

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

authRouter.get('/google/initiate', authController.googleInitiate)

authRouter.get('/google/callback', authController.googleCallback)

authRouter.get('/microsoft/initiate', authController.microsoftInitiate)

authRouter.get('/microsoft/callback', authController.microsoftCallback)

authRouter.post('/refresh', authController.refresh)

authRouter.post('/logout', authenticate, authController.logout)
