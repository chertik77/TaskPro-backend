import { randomBytes } from 'crypto'
import type { GoogleCodeSchema, SigninSchema, SignupSchema } from '@/schemas'
import type { JwtPayload, TypedRequestBody, TypedRequestQuery } from '@/types'
import type { CookieOptions, NextFunction, Request, Response } from 'express'

import { prisma } from '@/prisma'
import { hash, verify } from 'argon2'
import { OAuth2Client } from 'google-auth-library'
import { Conflict, Forbidden, Unauthorized } from 'http-errors'
import { jwtVerify, SignJWT } from 'jose'
import { JWTExpired } from 'jose/errors'

import { defaultUserAvatars, env, redisClient } from '@/config'

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
  NODE_ENV
} = env

class AuthController {
  private googleClient = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  )

  private readonly COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax'
  }

  private readonly ACCESS_TOKEN_NAME = 'accessToken'
  private readonly REFRESH_TOKEN_NAME = 'refreshToken'

  private createSessionAndSetCookies = async (
    res: Response,
    userId: string
  ) => {
    const session = await prisma.session.create({ data: { userId } })

    const accessToken = await new SignJWT({ id: userId, sid: session.id })
      .setExpirationTime(ACCESS_JWT_EXPIRES_IN)
      .setProtectedHeader({ alg: ACCESS_JWT_ALGORITHM })
      .sign(ACCESS_JWT_SECRET)

    const refreshToken = await new SignJWT({ id: userId, sid: session.id })
      .setExpirationTime(REFRESH_JWT_EXPIRES_IN)
      .setProtectedHeader({ alg: REFRESH_JWT_ALGORITHM })
      .sign(REFRESH_JWT_SECRET)

    res.cookie(this.ACCESS_TOKEN_NAME, accessToken, {
      ...this.COOKIE_OPTIONS,
      maxAge: 1000 * 60 * 60 // 1 hour
    })
    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      ...this.COOKIE_OPTIONS,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    })
  }

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

    await this.createSessionAndSetCookies(res, user.id)

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

    await this.createSessionAndSetCookies(res, user.id)

    res.json({ user: userWithoutPassword })
  }

  googleInitiate = async (_: Request, res: Response) => {
    const state = randomBytes(32).toString('hex')

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

    if (!storedState) return next(Forbidden('Invalid state'))

    await redisClient.del(redisStateKey)

    const {
      tokens: { id_token }
    } = await this.googleClient.getToken(code)

    if (!id_token) return next(Forbidden())

    const ticket = await this.googleClient.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.email) return next(Forbidden('Invalid token'))

    const {
      email,
      name = 'Guest',
      picture = defaultUserAvatars.light
    } = payload

    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.user.create({
        data: { name, email, avatar: picture }
      })
    }

    await this.createSessionAndSetCookies(res, user.id)

    res.redirect(FRONTEND_URL)
  }

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies[this.REFRESH_TOKEN_NAME]

    if (!refreshToken) return next(Forbidden())

    try {
      const {
        payload: { id, sid }
      } = await jwtVerify<JwtPayload>(refreshToken, REFRESH_JWT_SECRET)

      const user = await prisma.user.findUnique({ where: { id } })

      if (!user) return next(Forbidden())

      const currentSession = await prisma.session.findUnique({
        where: { id: sid }
      })

      if (!currentSession) return next(Forbidden())

      await prisma.session.delete({ where: { id: currentSession.id } })

      await this.createSessionAndSetCookies(res, user.id)

      res.json({ message: 'Tokens refreshed successfully' })
    } catch (error) {
      if (error instanceof JWTExpired) return next(Forbidden(error.code))

      return next(Forbidden())
    }
  }

  logout = async ({ session }: Request, res: Response) => {
    await prisma.session.delete({ where: { id: session } })

    res.clearCookie(this.ACCESS_TOKEN_NAME, this.COOKIE_OPTIONS)
    res.clearCookie(this.REFRESH_TOKEN_NAME, this.COOKIE_OPTIONS)

    res.sendStatus(204)
  }
}

export const authController = new AuthController()
