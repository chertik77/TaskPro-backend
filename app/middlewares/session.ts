import type { Application } from 'express'

import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import ObjectID from 'bson-objectid'
import session from 'express-session'

import { env } from '../config'
import { prisma } from '../prisma'

export const setupSessionMiddleware = (app: Application) => {
  app.use(
    session({
      secret: env.COOKIE_SECRET,
      resave: false,
      cookie: {
        domain: env.COOKIE_DOMAIN,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAME_SITE,
        maxAge: env.COOKIE_MAX_AGE
      },
      store: new PrismaSessionStore(prisma, {
        checkPeriod: env.SESSION_STORE_CHECK_PERIOD_MS,
        dbRecordIdFunction: () => ObjectID().toString()
      })
    })
  )
}
