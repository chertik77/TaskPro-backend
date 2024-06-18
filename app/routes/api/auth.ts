import { authController } from '@/controllers/auth'
import { Router } from 'express'
import { authenticate } from 'middlewares/authenticate'
import {
  GoogleAuthSchema,
  RefreshTokenSchema,
  SigninSchema,
  SignupSchema
} from 'schemas/user'
import { validateRequestBody } from 'zod-express-middleware'

export const authRouter = Router()

authRouter.post(
  '/signup',
  validateRequestBody(SignupSchema),
  authController.signup
)

authRouter.post(
  '/signin',
  validateRequestBody(SigninSchema),
  authController.signin
)

authRouter.post(
  '/google',
  validateRequestBody(GoogleAuthSchema),
  authController.signinByGoogle
)

authRouter.post(
  '/tokens',
  validateRequestBody(RefreshTokenSchema),
  authController.updateTokens
)

authRouter.post('/logout', authenticate, authController.logout)
