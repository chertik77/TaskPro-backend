import type { BetterAuthPlugin, Session } from 'better-auth'

import { passkey } from '@better-auth/passkey'
import { redisStorage } from '@better-auth/redis-storage'
import { APIError, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { createAuthEndpoint, createAuthMiddleware } from 'better-auth/api'
import { openAPI } from 'better-auth/plugins'

import { env, redisClient } from '../config'
import { prisma } from '../prisma'
import { mapMicrosoftProfileToUser } from './map-microsoft-profile-to-user'
import { parseUserAgent } from './parse-user-agent'

export const auth = betterAuth({
  appName: 'Task Pro',
  baseURL: env.BETTER_AUTH_URL,
  basePath: env.API_PREFIX + '/auth',
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
        before: async user => ({ data: { ...user, emailVerified: true } }),
        after: async user => {
          const userId = user.id
          await prisma.$transaction([
            prisma.userSettings.create({ data: { userId } }),
            prisma.taskSettings.create({ data: { userId } }),
            prisma.labelSettings.create({ data: { userId } }),
            prisma.accessibilitySettings.create({ data: { userId } })
          ])
        }
      }
    }
  },
  hooks: {
    after: createAuthMiddleware(async ctx => {
      if (ctx.path.startsWith('/list-sessions')) {
        const sessions = ctx.context.returned as Session[] | APIError

        if (sessions instanceof APIError) return ctx.context.returned

        const currentSession = ctx.context.session?.session

        const updatedSessions = sessions
          .map(session => {
            const { userAgent, ...rest } = session
            const { browser, os } = parseUserAgent(userAgent)

            return {
              ...rest,
              browser,
              os,
              isCurrent: session.id === currentSession?.id
            }
          })
          .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent))

        return updatedSessions
      }
    })
  },
  user: { additionalFields: { imagePublicId: { type: 'string' } } },
  session: { storeSessionInDatabase: true },
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
  plugins: [
    revokeSessionByIdPLugin(),
    openAPI({ disableDefaultReference: true }),
    passkey({
      rpID: env.RP_ID,
      rpName: 'Task Pro',
      advanced: { webAuthnChallengeCookie: 'task-pro-passkey' }
    })
  ]
})

function revokeSessionByIdPLugin() {
  return {
    id: 'revoke-session-id',
    endpoints: {
      revokeSessionById: createAuthEndpoint(
        '/revoke-session-id',
        { method: 'POST' },
        async ctx => {
          if (!ctx.headers) return ctx.error(401, { message: 'Unauthorized' })

          const sessionId = ctx.body.id

          const session = await prisma.session.findUnique({
            where: { id: sessionId }
          })

          if (!session) return ctx.error(404, { message: 'Session not found' })

          await ctx.context.internalAdapter.deleteSession(session.token)

          return ctx.json({ success: true })
        }
      )
    }
  } satisfies BetterAuthPlugin
}
