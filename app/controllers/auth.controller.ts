import type { NextFunction, Request, Response } from 'express'

import { TypedRequestBody } from '@/types'
import { compare, hash } from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import { Conflict, Forbidden, Unauthorized } from 'http-errors'
import { sign, verify, VerifyErrors } from 'jsonwebtoken'

import { prisma } from '@/config/prisma'

import { GoogleAuthSchema, SigninSchema, SignupSchema } from '@/schemas'
import { env, getUserInfoFromGoogleApi } from '@/utils'

const {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_JWT_SECRET,
  ACCESS_JWT_SECRET,
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
        password: await hash(body.password, 10)
      }
    })

    const newSession = await prisma.session.create({
      data: { userId: user.id }
    })

    const tokens = this.getNewTokens({ id: user.id, sid: newSession.id })

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

    const isPasswordMatch = await compare(body.password, password)

    if (!isPasswordMatch) return next(Unauthorized('Email or password invalid'))

    const newSession = await prisma.session.create({
      data: { userId: user.id }
    })

    const tokens = this.getNewTokens({ id: user.id, sid: newSession.id })

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

    const { name, email, sub, picture } = await getUserInfoFromGoogleApi(
      tokens.access_token!
    )

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: await hash(sub, 10),
          avatar: picture,
          avatarPublicId: 'google-picture'
        }
      })

      const newSession = await prisma.session.create({
        data: { userId: user.id }
      })

      const tokens = this.getNewTokens({ id: user.id, sid: newSession.id })

      res.json({ user, ...tokens })
    } else {
      const newSession = await prisma.session.create({
        data: { userId: user.id }
      })

      const tokens = this.getNewTokens({ id: user.id, sid: newSession.id })

      res.json({ user, ...tokens })
    }
  }

  tokens = async ({ body }: Request, res: Response, next: NextFunction) => {
    try {
      const { id, sid } = verify(body.refreshToken, REFRESH_JWT_SECRET) as {
        id: string
        sid: string
      }

      const user = await prisma.user.findFirst({ where: { id } })

      if (!user) return next(Forbidden())

      const currentSession = await prisma.session.findFirst({
        where: { id: sid }
      })

      if (!currentSession) return next(Forbidden())

      await prisma.session.delete({ where: { id: sid } })

      const newSid = await prisma.session.create({
        data: { userId: user.id }
      })

      const tokens = this.getNewTokens({ id: user.id, sid: newSid.id })

      res.json(tokens)
    } catch (error) {
      return next(Forbidden((error as VerifyErrors).message))
    }
  }

  logout = async ({ session }: Request, res: Response) => {
    await prisma.session.delete({ where: { id: session } })

    res.status(204).send()
  }

  private getNewTokens = (payload: { id: string; sid: string }) => {
    const accessToken = sign(payload, ACCESS_JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    })

    const refreshToken = sign(payload, REFRESH_JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN
    })

    return { accessToken, refreshToken }
  }
}

export const authController = new AuthController()
