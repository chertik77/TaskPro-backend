import { redisStorage } from '@better-auth/redis-storage'
import { Theme } from '@prisma/client'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'

import { env, redisClient } from '../config'
import { prisma } from '../prisma'
import { mapMicrosoftProfileToUser } from './map-microsoft-profile-to-user'

export const auth = betterAuth({
  appName: 'Task Pro',
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: 'mongodb' }),
  advanced: {
    cookiePrefix: 'taskpro',
    database: { generateId: false },
    disableOriginCheck: env.NODE_ENV !== 'production'
  },
  secondaryStorage: redisStorage({
    client: redisClient,
    keyPrefix: 'taskpro:'
  }),
  databaseHooks: {
    user: {
      create: {
        before: async user => ({ data: { ...user, emailVerified: true } })
      }
    }
  },
  user: {
    additionalFields: {
      theme: { type: Object.values(Theme), input: true },
      imagePublicId: { type: 'string', input: true }
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
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      profilePhotoSize: 96,
      tenantId: 'consumers',
      prompt: 'select_account',
      mapProfileToUser: async profile =>
        await mapMicrosoftProfileToUser(profile)
    }
  },
  trustedOrigins: env.ALLOWED_ORIGINS,
  disabledPaths: ['/verify-email', '/send-verification-email'],
  plugins: [openAPI({ disableDefaultReference: true })]
})
