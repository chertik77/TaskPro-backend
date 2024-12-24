import { Router } from 'express'
import { compare, hash } from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import { Conflict, Forbidden, Unauthorized } from 'http-errors'
import { sign, verify } from 'jsonwebtoken'
import { prisma } from 'prisma/prisma.client'

import { authenticate, validateRequest } from 'middlewares'

import {
  GoogleAuthSchema,
  RefreshTokenSchema,
  SigninSchema,
  SignupSchema
} from 'schemas/user'
import { getUserInfoFromGoogleApi } from 'utils/getUserInfoFromGoogleApi'

export const authRouter = Router()

const {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_JWT_SECRET,
  ACCESS_JWT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
} = process.env

authRouter.post(
  '/signup',
  validateRequest({ body: SignupSchema }),
  async ({ body }, res, next) => {
    const isUserExists = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (isUserExists) return next(Conflict('Email already exist'))

    const user = await prisma.user.create({
      data: {
        ...body,
        password: await hash(body.password, 10)
      },
      omit: { password: true }
    })

    const newSession = await prisma.session.create({
      data: { userId: user.id }
    })

    const tokens = getNewTokens({ id: user.id, sid: newSession.id })

    res.json({ user, ...tokens })
  }
)

authRouter.post(
  '/signin',
  validateRequest({ body: SigninSchema }),
  async ({ body }, res, next) => {
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (!user) return next(Unauthorized('Email or password invalid'))

    const { password, ...userWithoutPassword } = user

    const isPasswordMatch = await compare(body.password, password)

    if (!isPasswordMatch) return next(Unauthorized('Email or password invalid'))

    const newSession = await prisma.session.create({
      data: { userId: user.id }
    })

    const tokens = getNewTokens({ id: user.id, sid: newSession.id })

    res.json({ user: userWithoutPassword, ...tokens })
  }
)

authRouter.post(
  '/google',
  validateRequest({ body: GoogleAuthSchema }),
  async ({ body }, res) => {
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
        },
        omit: { password: true }
      })

      const newSession = await prisma.session.create({
        data: { userId: user.id }
      })

      const tokens = getNewTokens({ id: user.id, sid: newSession.id })

      res.json({ user, ...tokens })
    } else {
      const newSession = await prisma.session.create({
        data: { userId: user.id }
      })

      const tokens = getNewTokens({ id: user.id, sid: newSession.id })

      res.json({ user, ...tokens })
    }
  }
)

authRouter.post(
  '/tokens',
  validateRequest({ body: RefreshTokenSchema }),
  async ({ body }, res, next) => {
    try {
      const { id, sid } = verify(body.refreshToken, REFRESH_JWT_SECRET!) as {
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

      const newSid = await prisma.session.create({ data: { userId: user.id } })

      const tokens = getNewTokens({ id: user.id, sid: newSid.id })

      res.json(tokens)
    } catch {
      return next(Forbidden())
    }
  }
)

authRouter.post('/logout', authenticate, async ({ session }, res) => {
  await prisma.session.delete({ where: { id: session } })

  res.status(204).send()
})

const getNewTokens = (payload: { id: string; sid: string }) => {
  const accessToken = sign(payload, ACCESS_JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  })

  const refreshToken = sign(payload, REFRESH_JWT_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  })

  return { accessToken, refreshToken }
}
