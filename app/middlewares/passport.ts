import type { Application } from 'express'

import { SignupPassportStrategy } from '@/strategies'
import passport from 'passport'

import { SigninPassportStrategy } from '../strategies/signin.strategy'

export const setupPassportMiddleware = (app: Application) => {
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use('signup', SignupPassportStrategy)
  passport.use('signin', SigninPassportStrategy)
}
