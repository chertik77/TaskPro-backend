import { Theme } from '@prisma/client'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'

import { env } from './config'
import { prisma } from './prisma'

export const auth = betterAuth({
  appName: 'Task Pro',
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, { provider: 'mongodb' }),
  advanced: {
    cookiePrefix: 'taskpro',
    database: { generateId: false },
    disableOriginCheck: env.NODE_ENV !== 'production'
  },
  user: {
    additionalFields: {
      theme: { type: Object.values(Theme), input: false }
    }
  },
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    },
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET
    }
  },
  trustedOrigins: env.ALLOWED_ORIGINS,
  plugins: [openAPI()]
})
