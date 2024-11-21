import type { NextFunction, Request, Response } from 'express'

import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'

import { Session, User } from 'models'

import { getUserInfoFromGoogleApi } from 'utils/getUserInfoFromGoogleApi'

const {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_JWT_SECRET,
  ACCESS_JWT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
} = process.env

class Controller {
  signup = async (req: Request, res: Response, next: NextFunction) => {
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

  signin = async (req: Request, res: Response, next: NextFunction) => {
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

  signinByGoogle = async (req: Request, res: Response) => {
    const oAuth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      'postmessage'
    )

    const { tokens } = await oAuth2Client.getToken(req.body.code)

    const { name, sub, email, picture } = await getUserInfoFromGoogleApi(
      tokens.access_token!
    )

    const user = await User.findOne({ email })

    if (!user) {
      const user = await User.create({
        name,
        email,
        password: await bcrypt.hash(sub, 10),
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

  updateTokens = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, sid } = jwt.verify(
        req.body.refreshToken,
        REFRESH_JWT_SECRET!
      ) as {
        id: string
        sid: string
      }

      const user = await User.findById(id)

      if (!user) {
        return next(createHttpError(403))
      }

      const currentSession = await Session.findById(sid)

      if (!currentSession) {
        return next(createHttpError(403))
      }

      await Session.findByIdAndDelete(sid)

      const newSid = await Session.create({ uid: user._id })

      const tokens = this.getNewTokens({ id: user._id, sid: newSid._id })

      res.json({ ...tokens })
    } catch (e) {
      return next(createHttpError(403))
    }
  }

  logout = async (req: Request, res: Response) => {
    await Session.findByIdAndDelete(req.session._id)

    res.status(204).send()
  }

  private getNewTokens = (payload: {
    id: Types.ObjectId
    sid: Types.ObjectId
  }) => {
    const accessToken = jwt.sign(payload, ACCESS_JWT_SECRET!, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    })

    const refreshToken = jwt.sign(payload, REFRESH_JWT_SECRET!, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN
    })

    return { accessToken, refreshToken }
  }
}

export const authController = new Controller()
