import crypto from 'crypto'
import type {
  GoogleCodeSchema,
  RefreshTokenSchema,
  SigninSchema,
  SignupSchema
} from '@/schemas'
import type { JwtPayload } from '@/types'
import type { NextFunction, Request, Response } from 'express'
import type { TypedRequestBody } from 'zod-express-middleware'

import { prisma } from '@/prisma'
import { hash, verify } from 'argon2'
import { OAuth2Client } from 'google-auth-library'
import { Conflict, Forbidden, Unauthorized } from 'http-errors'
import { jwtVerify, SignJWT } from 'jose'
import { JWTExpired } from 'jose/errors'

import { env, redisClient } from '@/config'

const {
  ACCESS_JWT_EXPIRES_IN,
  REFRESH_JWT_EXPIRES_IN,
  REFRESH_JWT_SECRET,
  ACCESS_JWT_SECRET,
  ACCESS_JWT_ALGORITHM,
  REFRESH_JWT_ALGORITHM,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
} = env

class AuthController {
  googleClient = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  )

  signup = async (
    { body }: TypedRequestBody<typeof SignupSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const isUserExists = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (isUserExists) return next(Conflict('Email already exist'))

    const user = await prisma.user.create({
      data: {
        ...body,
        password: await hash(body.password)
      }
    })

    const newSession = await prisma.session.create({
      data: { userId: user.id }
    })

    const tokens = await this.getNewTokens({ id: user.id, sid: newSession.id })

    res.json({ user, ...tokens })
  }

  signin = async (
    { body }: TypedRequestBody<typeof SigninSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      omit: { password: false }
    })

    if (!user) return next(Unauthorized('Email or password invalid'))

    const { password, ...userWithoutPassword } = user

    if (!password) return next(Unauthorized('Email or password invalid'))

    const isPasswordMatch = await verify(password, body.password)

    if (!isPasswordMatch) return next(Unauthorized('Email or password invalid'))

    const newSession = await prisma.session.create({
      data: { userId: user.id }
    })

    const tokens = await this.getNewTokens({ id: user.id, sid: newSession.id })

    res.json({ user: userWithoutPassword, ...tokens })
  }

  getGoogleRedirectUrl = async (_: Request, res: Response) => {
    const state = crypto.randomBytes(32).toString('hex')

    await redisClient.set(`oauth_state:${state}`, 'true', 'EX', 5 * 60)

    const url = this.googleClient.generateAuthUrl({
      state,
      access_type: 'offline',
      scope: ['profile', 'email']
    })

    res.json({ redirectUrl: url })
  }

  googleCallback = async (
    req: TypedRequestBody<typeof GoogleCodeSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const { code, state: receivedState } = req.body

    const redisStateKey = `oauth_state:${receivedState}`

    const storedState = await redisClient.get(redisStateKey)

    if (storedState) {
      await redisClient.del(redisStateKey)
    }

    const { tokens } = await this.googleClient.getToken(code)

    if (!tokens.id_token) return next(Forbidden())

    const ticket = await this.googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.email || !payload.name || !payload.picture) {
      return next(Forbidden('Invalid token'))
    }

    const { name, email, picture } = payload

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      const user = await prisma.user.create({
        data: { name, email, avatar: picture }
      })

      const newSession = await prisma.session.create({
        data: { userId: user.id }
      })

      const tokens = await this.getNewTokens({
        id: user.id,
        sid: newSession.id
      })

      res.json({ user, ...tokens })
    } else {
      const newSession = await prisma.session.create({
        data: { userId: user.id }
      })

      const tokens = await this.getNewTokens({
        id: user.id,
        sid: newSession.id
      })

      res.json({ user, ...tokens })
    }
  }

  refresh = async (
    { body }: TypedRequestBody<typeof RefreshTokenSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        payload: { id, sid }
      } = await jwtVerify<JwtPayload>(body.refreshToken, REFRESH_JWT_SECRET)

      const user = await prisma.user.findFirst({ where: { id } })

      if (!user) return next(Forbidden())

      const currentSession = await prisma.session.findFirst({
        where: { id: sid }
      })

      if (!currentSession) return next(Forbidden())

      await prisma.session.delete({ where: { id: currentSession.id } })

      const newSid = await prisma.session.create({
        data: { userId: user.id }
      })

      const tokens = await this.getNewTokens({ id: user.id, sid: newSid.id })

      res.json(tokens)
    } catch (error) {
      if (error instanceof JWTExpired) return next(Forbidden(error.code))

      return next(Forbidden())
    }
  }

  logout = async ({ session }: Request, res: Response) => {
    await prisma.session.delete({ where: { id: session } })

    res.sendStatus(204)
  }

  private getNewTokens = async (payload: JwtPayload) => {
    const accessToken = await new SignJWT(payload)
      .setExpirationTime(ACCESS_JWT_EXPIRES_IN)
      .setProtectedHeader({ alg: ACCESS_JWT_ALGORITHM })
      .sign(ACCESS_JWT_SECRET)

    const refreshToken = await new SignJWT(payload)
      .setExpirationTime(REFRESH_JWT_EXPIRES_IN)
      .setProtectedHeader({ alg: REFRESH_JWT_ALGORITHM })
      .sign(REFRESH_JWT_SECRET)

    return { accessToken, refreshToken }
  }
}

export const authController = new AuthController()
