import {
  getCurrent,
  refresh,
  signin,
  signout,
  signup
} from 'controllers/auth-controller'
import { validateBody } from 'decorators/validateBody'
import { Router } from 'express'
import { authenticate } from 'middlewares/authenticate'
import { refreshTokenSchema, signinSchema, signupSchema } from 'schemas/user'

export const authRouter = Router()

authRouter.post('/signup', validateBody(signupSchema), signup)

authRouter.post('/signin', validateBody(signinSchema), signin)

authRouter.post('/refresh', validateBody(refreshTokenSchema), refresh)

authRouter.get('/current', authenticate, getCurrent)

authRouter.post('/signout', authenticate, signout)
