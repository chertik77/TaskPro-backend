import { AuthController } from '@/controllers/auth'
import { Router } from 'express'
import { createValidator } from 'express-joi-validation'
import { authenticate } from 'middlewares/authenticate'
import { refreshTokenSchema, signinSchema, signupSchema } from 'schemas/user'

const validator = createValidator()

export const authRouter = Router()

authRouter.post('/signup', validator.body(signupSchema), AuthController.signup)

authRouter.post('/signin', validator.body(signinSchema), AuthController.signin)

authRouter.post('/logout', authenticate, AuthController.logout)

authRouter.post(
  '/tokens',
  validator.body(refreshTokenSchema),
  AuthController.updateTokens
)

authRouter.post('/google', AuthController.signupByGoogle)
