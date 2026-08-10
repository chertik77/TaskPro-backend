import type { BetterAuthPlugin, Session } from 'better-auth'

import { passkey } from '@better-auth/passkey'
import { redisStorage } from '@better-auth/redis-storage'
import { APIError, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import {
  createAuthEndpoint,
  createAuthMiddleware,
  sessionMiddleware
} from 'better-auth/api'
import * as z from 'zod'

import { env, redisClient } from '../config'
import { prisma } from '../prisma'
import { mapMicrosoftProfileToUser, parseUserAgent } from '../utils'

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
        before: async user => ({ data: { ...user, emailVerified: true } })
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
  account: {
    accountLinking: {
      trustedProviders: ['google', 'microsoft', 'email-password']
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
  plugins: [
    revokeSessionByIdPlugin(),
    passkey({
      rpID: env.RP_ID,
      rpName: 'Task Pro',
      advanced: { webAuthnChallengeCookie: 'task-pro-passkey' }
    })
  ]
})

function revokeSessionByIdPlugin() {
  return {
    id: 'revoke-session-id',
    endpoints: {
      revokeSessionById: createAuthEndpoint(
        '/revoke-session-id',
        {
          method: 'POST',
          requireHeaders: true,
          use: [sessionMiddleware],
          body: z.object({ id: z.string() })
        },
        async ctx => {
          const { user } = ctx.context.session

          const sessions = await ctx.context.internalAdapter.listSessions(
            user.id
          )

          const session = sessions.find(({ id }) => id === ctx.body.id)

          if (!session) throw ctx.error(404, { message: 'Session not found' })

          await ctx.context.internalAdapter.deleteSession(session.token)

          return ctx.json({ success: true })
        }
      )
    }
  } satisfies BetterAuthPlugin
}
