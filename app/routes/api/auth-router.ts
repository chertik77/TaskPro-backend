import express from 'express'

import {
  getCurrent,
  refresh,
  signin,
  signout,
  signup
} from 'controllers/auth-controller'

import * as userSchemas from 'models/User'

import { validateBody } from 'decorators/validateBody'

import { authenticate } from 'middlewares/authenticate'

export const authRouter = express.Router()

const userSignupValidate = validateBody(userSchemas.userSignupSchema)
const userSigninValidate = validateBody(userSchemas.userSigninSchema)
const userRefreshValidate = validateBody(userSchemas.userRefreshTokenSchema)

authRouter.post('/signup', userSignupValidate, signup)

authRouter.post('/signin', userSigninValidate, signin)

authRouter.post('/refresh', userRefreshValidate, refresh)

authRouter.get('/current', authenticate, getCurrent)

authRouter.post('/signout', authenticate, signout)
