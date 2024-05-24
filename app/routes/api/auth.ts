import { AuthController } from '@/controllers/auth'
import { Router } from 'express'
import { createValidator } from 'express-joi-validation'
import { authenticate } from 'middlewares/authenticate'
import { signinSchema, signupSchema } from 'schemas/user'

const validator = createValidator()

export const authRouter = Router()

authRouter.post('/signup', validator.body(signupSchema), AuthController.signup)

authRouter.post('/signin', validator.body(signinSchema), AuthController.signin)

authRouter.get('/current', authenticate, AuthController.current)

authRouter.post('/logout', authenticate, AuthController.logout)
