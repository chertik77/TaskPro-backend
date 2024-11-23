import { Router } from 'express'
import { prisma } from 'app'
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { validateRequestBody } from 'zod-express-middleware'

import { authenticate } from 'middlewares/authenticate'

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
  validateRequestBody(SignupSchema),
  async ({ body }, res, next) => {
    const isUserExists = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (isUserExists) {
      return next(createHttpError(409, 'Email already exist'))
    }

    const user = await prisma.user.create({
      data: {
        ...body,
        password: await bcrypt.hash(body.password, 10)
      },
      omit: { password: true }
    })

    const newSession = await prisma.session.create({
      data: { userId: user.id }
    })

    const tokens = getNewTokens({ id: user.id, sid: newSession.id })

    res.status(201).json({ user, ...tokens })
  }
)

authRouter.post(
  '/signin',
  validateRequestBody(SigninSchema),
  async ({ body }, res, next) => {
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (!user) {
      return next(createHttpError(401, 'Email or password invalid'))
    }

    const { password, ...userWithoutPassword } = user

    const isPasswordMatch = await bcrypt.compare(body.password, password)

    if (!isPasswordMatch) {
      return next(createHttpError(401, 'Email or password invalid'))
    }

    const newSession = await prisma.session.create({
      data: { userId: user.id }
    })

    const tokens = getNewTokens({ id: user.id, sid: newSession.id })

    res.json({ user: userWithoutPassword, ...tokens })
  }
)

authRouter.post(
  '/google',
  validateRequestBody(GoogleAuthSchema),
  async ({ body }, res) => {
    const oAuth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      'postmessage'
    )

    const { tokens } = await oAuth2Client.getToken(body.code)

    const userInfo = await getUserInfoFromGoogleApi(tokens.access_token!)

    const user = await prisma.user.findUnique({
      where: { email: userInfo.email }
    })

    if (!user) {
      const user = await prisma.user.create({
        data: {
          ...userInfo,
          password: await bcrypt.hash(userInfo.sub, 10),
          avatar: userInfo.picture,
          avatarPublicId: 'google-picture'
        }
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
  validateRequestBody(RefreshTokenSchema),
  async ({ body }, res, next) => {
    try {
      const { id, sid } = jwt.verify(
        body.refreshToken,
        REFRESH_JWT_SECRET!
      ) as {
        id: string
        sid: string
      }

      const user = await prisma.user.findFirst({ where: { id } })

      if (!user) {
        return next(createHttpError(403))
      }

      const currentSession = await prisma.session.findFirst({
        where: { id: sid }
      })

      if (!currentSession) {
        return next(createHttpError(403))
      }

      await prisma.session.delete({ where: { id: sid } })

      const newSid = await prisma.session.create({ data: { userId: user.id } })

      const tokens = getNewTokens({ id: user.id, sid: newSid.id })

      res.json({ ...tokens })
    } catch (e) {
      return next(createHttpError(403))
    }
  }
)

authRouter.post('/logout', authenticate, async ({ session }, res) => {
  await prisma.session.delete({ where: { id: session } })

  res.status(204).send()
})

const getNewTokens = (payload: { id: string; sid: string }) => {
  const accessToken = jwt.sign(payload, ACCESS_JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  })

  const refreshToken = jwt.sign(payload, REFRESH_JWT_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  })

  return { accessToken, refreshToken }
}
