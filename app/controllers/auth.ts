import bcrypt from 'bcrypt'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { jwtDecode } from 'jwt-decode'
import { Session } from 'models/Session'
import { User } from 'models/User'
import { Types } from 'mongoose'

import { SignupSchema } from '@/schemas/user'

import { TypedRequestBody } from 'zod-express-middleware'

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

  signin = async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body?.email })

    if (!user) {
      return next(createHttpError(401, 'Email or password invalid'))
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body?.password as string,
      user.password
    )

    if (!isPasswordMatch) {
      return next(createHttpError(401, 'Email or password invalid'))
    }

    const newSession = await Session.create({ uid: user._id })

    const payload = { id: user._id, sid: newSession._id }

    const tokens = this.getNewTokens(payload)

    res.json({ user, ...tokens })
  }

  signupByGoogle = async (req: Request, res: Response) => {
    const decoded = jwtDecode<{
      name: string
      email: string
      sub: string
      picture: string
    }>(req.body.credential)

    const user = await User.findOne({ email: decoded.email })

    if (!user) {
      const hashPassword = await bcrypt.hash(decoded.sub, 10)

      const newUser = await User.create({
        name: decoded.name,
        email: decoded.email,
        password: hashPassword,
        avatar: { url: decoded.picture, publicId: 'google-picture' }
      })

      const newSession = await Session.create({ uid: newUser._id })

      await newUser.save()

      const tokens = this.getNewTokens({ id: newUser._id, sid: newSession._id })

      res.json({ user: newUser, ...tokens })
    } else {
      const newSession = await Session.create({ uid: user._id })

      const tokens = this.getNewTokens({ id: user._id, sid: newSession._id })

      res.json({ user, ...tokens })
    }
  }

  updateTokens = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken: incomingRefreshToken } = req.body

    try {
      const { id, sid } = jwt.verify(incomingRefreshToken, JWT_SECRET!) as {
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

      const payload = { id: user._id, sid: newSid._id }

      const tokens = this.getNewTokens(payload)

      res.json({ ...tokens })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log(e)
      if (e.message === 'jwt expired') {
        res.status(403).json({ error: 'jwt expired' })
      }
    }
  }

  logout = async (req: Request, res: Response) => {
    await Session.findByIdAndDelete(req.session._id)

    res.status(204).json({})
  }

  private getNewTokens = (payload: {
    id: Types.ObjectId
    sid: Types.ObjectId
  }) => {
    const accessToken = jwt.sign(payload, JWT_SECRET as jwt.Secret, {
      expiresIn: '1h'
    })

    const refreshToken = jwt.sign(payload, JWT_SECRET as jwt.Secret, {
      expiresIn: '7d'
    })

    return { accessToken, refreshToken }
  }
}

export const authController = new Controller()
