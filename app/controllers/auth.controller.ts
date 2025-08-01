import crypto from 'crypto'
import type { GoogleCodeSchema, SigninSchema, SignupSchema } from '@/schemas'
import type { JwtPayload, TypedRequestBody, TypedRequestQuery } from '@/types'
import type { NextFunction, Request, Response } from 'express'

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
  GOOGLE_REDIRECT_URI,
  FRONTEND_URL,
  COOKIE_HTTP_ONLY,
  COOKIE_DOMAIN,
  COOKIE_SECURE,
  COOKIE_SAME_SITE
} = env

class AuthController {
  private googleClient = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  )

  private readonly ACCESS_TOKEN_NAME = 'accessToken'
  private readonly REFRESH_TOKEN_NAME = 'refreshToken'

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

    this.setTokensCookie(res, tokens)

    res.json({ user })
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

    this.setTokensCookie(res, tokens)

    res.json({ user: userWithoutPassword })
  }

  googleRedirect = async (_: Request, res: Response) => {
    const state = crypto.randomBytes(32).toString('hex')

    await redisClient.set(`oauth_state:${state}`, 'true', 'EX', 5 * 60)

    const url = this.googleClient.generateAuthUrl({
      state,
      access_type: 'offline',
      scope: ['profile', 'email']
    })

    res.redirect(url)
  }

  googleCallback = async (
    req: TypedRequestQuery<typeof GoogleCodeSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const { code, state: receivedState } = req.query

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

      this.setTokensCookie(res, tokens)

      res.redirect(FRONTEND_URL)
    } else {
      const newSession = await prisma.session.create({
        data: { userId: user.id }
      })

      const tokens = await this.getNewTokens({
        id: user.id,
        sid: newSession.id
      })

      this.setTokensCookie(res, tokens)

      res.redirect(FRONTEND_URL)
    }
  }

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) return next(Forbidden())

    try {
      const {
        payload: { id, sid }
      } = await jwtVerify<JwtPayload>(refreshToken, REFRESH_JWT_SECRET)

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

  logout = async (_: Request, res: Response) => {
    res.clearCookie(this.ACCESS_TOKEN_NAME)
    res.clearCookie(this.REFRESH_TOKEN_NAME)

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

  private setTokensCookie = (
    res: Response,
    tokens: { accessToken: string; refreshToken: string }
  ) => {
    res.cookie(this.ACCESS_TOKEN_NAME, tokens.accessToken, {
      httpOnly: COOKIE_HTTP_ONLY,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAME_SITE,
      domain: COOKIE_DOMAIN
    })

    res.cookie(this.REFRESH_TOKEN_NAME, tokens.refreshToken, {
      httpOnly: COOKIE_HTTP_ONLY,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAME_SITE,
      domain: COOKIE_DOMAIN
    })
  }
}

export const authController = new AuthController()
