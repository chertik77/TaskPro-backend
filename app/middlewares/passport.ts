import type { Application } from 'express'

import passport from 'passport'

import { SignupPassportStrategy } from '@/strategies'

import { SigninPassportStrategy } from '../strategies/signin.strategy'

export const setupPassportMiddleware = (app: Application) => {
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use('signup', SignupPassportStrategy)
  passport.use('signin', SigninPassportStrategy)
}
