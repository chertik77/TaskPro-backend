import type { NextFunction, Request, Response } from 'express'
import type { TypedRequestBody } from 'zod-express-middleware'

import bcrypt from 'bcrypt'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { jwtDecode } from 'jwt-decode'
import { Types } from 'mongoose'

import { Session, User } from 'models'

import {
  GoogleAuthSchema,
  RefreshTokenSchema,
  SigninSchema,
  SignupSchema
} from 'schemas/user'

const { JWT_SECRET } = process.env

class Controller {
  signup = async (
    req: TypedRequestBody<typeof SignupSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const isUserExists = await User.findOne({ email: req.body.email })

    if (isUserExists) {
      return next(createHttpError(409, 'Email already exist'))
    }

    const user = await User.create({
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10)
    })

    const newSession = await Session.create({ uid: user._id })

    const tokens = this.getNewTokens({ id: user._id, sid: newSession._id })

    res.status(201).json({ user, ...tokens })
  }

  signin = async (
    req: TypedRequestBody<typeof SigninSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return next(createHttpError(401, 'Email or password invalid'))
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    )

    if (!isPasswordMatch) {
      return next(createHttpError(401, 'Email or password invalid'))
    }

    const newSession = await Session.create({ uid: user._id })

    const tokens = this.getNewTokens({ id: user._id, sid: newSession._id })

    res.json({ user, ...tokens })
  }

  signinByGoogle = async (
    req: TypedRequestBody<typeof GoogleAuthSchema>,
    res: Response
  ) => {
    const { email, name, picture, sub } = jwtDecode<{
      name: string
      email: string
      sub: string
      picture: string
    }>(req.body.credential)

    const user = await User.findOne({ email })

    if (!user) {
      const hashPassword = await bcrypt.hash(sub, 10)

      const user = await User.create({
        name,
        email,
        password: hashPassword,
        avatar: { url: picture, publicId: 'google-picture' }
      })

      const newSession = await Session.create({ uid: user._id })

      const tokens = this.getNewTokens({ id: user._id, sid: newSession._id })

      res.json({ user, ...tokens })
    } else {
      const newSession = await Session.create({ uid: user._id })

      const tokens = this.getNewTokens({ id: user._id, sid: newSession._id })

      res.json({ user, ...tokens })
    }
  }

  updateTokens = async (
    req: TypedRequestBody<typeof RefreshTokenSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, sid } = jwt.verify(req.body.refreshToken, JWT_SECRET!) as {
        id: string
        sid: string
      }

      const user = await User.findById(id)

      if (!user) {
        return next(createHttpError(403))
      }

      const currentSession = await Session.findOne({ _id: sid })

      if (!currentSession) {
        return next(createHttpError(403))
      }

      await Session.deleteOne({ _id: sid })

      const newSid = await Session.create({ uid: user._id })

      const tokens = this.getNewTokens({ id: user._id, sid: newSid._id })

      res.json({ ...tokens })
    } catch (e) {
      return next(createHttpError(403))
    }
  }

  logout = async (req: Request, res: Response) => {
    await Session.findByIdAndDelete(req.session._id)

    res.status(204).json()
  }

  private getNewTokens = (payload: {
    id: Types.ObjectId
    sid: Types.ObjectId
  }) => {
    const accessToken = jwt.sign(payload, JWT_SECRET!, {
      expiresIn: process.env.ACESS_TOKEN_EXPIRES_IN
    })

    const refreshToken = jwt.sign(payload, JWT_SECRET!, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
    })

    return { accessToken, refreshToken }
  }
}

export const authController = new Controller()
