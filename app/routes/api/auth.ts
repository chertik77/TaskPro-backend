import { Router } from 'express'
import passport from 'passport'
import { validateRequest } from 'zod-express-middleware'

import { authController } from '@/controllers'

import { authenticate } from '@/middlewares'

import { SigninSchema, SignupSchema } from '@/schemas'

export const authRouter = Router()

authRouter.post(
  '/signup',
  validateRequest({ body: SignupSchema }),
  passport.authenticate('signup'),
  authController.signup
)

authRouter.post(
  '/signin',
  validateRequest({ body: SigninSchema }),
  passport.authenticate('signin'),
  authController.signin
)

// authRouter.post(
//   '/google',
//   validate([
//     body('code').isString().notEmpty().withMessage('Code is required')
//   ]),
//   authController.google
// )

authRouter.post('/logout', authenticate, authController.logout)
