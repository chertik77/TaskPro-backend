import type { JwtPayload, TypedRequestBody } from '@/types'
import type { NextFunction, Request, Response } from 'express'

import { hash, verify } from 'argon2'
import { OAuth2Client } from 'google-auth-library'
import { Conflict, Forbidden, Unauthorized } from 'http-errors'
import { jwtVerify, SignJWT } from 'jose'
import { JWTExpired } from 'jose/errors'

import { prisma } from '@/config/prisma'

import {
  GoogleAuthSchema,
  RefreshTokenSchema,
  SigninSchema,
  SignupSchema
} from '@/schemas'
import { env, getUserInfoFromGoogleApi } from '@/utils'

const {
  ACCESS_JWT_EXPIRES_IN,
  REFRESH_JWT_EXPIRES_IN,
  REFRESH_JWT_SECRET,
  ACCESS_JWT_SECRET,
  ACCESS_JWT_ALGORITHM,
  REFRESH_JWT_ALGORITHM,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
} = env

class AuthController {
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

  google = async (
    { body }: TypedRequestBody<typeof GoogleAuthSchema>,
    res: Response
  ) => {
    const oAuth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      'postmessage'
    )

    const { tokens } = await oAuth2Client.getToken(body.code)

    const { name, email, picture } = await getUserInfoFromGoogleApi(
      tokens.access_token!
    )

    const user = await prisma.user.findUnique({ where: { email } })

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

  tokens = async (
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
      if (error instanceof JWTExpired) {
        if (error.payload.sid) {
          await prisma.session.delete({
            where: { id: error.payload.sid as string }
          })
        }

        return next(Forbidden(error.code))
      }

      return next(Forbidden())
    }
  }

  logout = async ({ session }: Request, res: Response) => {
    await prisma.session.delete({ where: { id: session } })

    res.status(204).send()
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
