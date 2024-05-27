import bcrypt from 'bcrypt'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { Session } from 'models/Session'
import { User } from 'models/User'
import { Types } from 'mongoose'

const { JWT_SECRET } = process.env

class Controller {
  signup = async (req: Request, res: Response, next: NextFunction) => {
    const isUserExists = await User.findOne({ email: req.body.email })

    if (isUserExists) {
      return next(createHttpError(409, 'Email already exist'))
    }

    const newUser = await User.create({
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10)
    })

    const newSession = await Session.create({ uid: newUser._id })

    const payload = { id: newUser._id, sid: newSession._id }

    const tokens = this.getNewTokens(payload)

    res.status(201).json({ newUser, ...tokens })
  }

  signin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return next(createHttpError(401, 'Email or password invalid'))
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return next(createHttpError(401, 'Email or password invalid'))
    }

    const newSession = await Session.create({ uid: user.id })

    const payload = { id: user._id, sid: newSession._id }

    const tokens = this.getNewTokens(payload)

    res.json({ user, ...tokens })
  }

  updateTokens = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken: incomingRefreshToken } = req.body

    const { id, sid } = jwt.verify(incomingRefreshToken, JWT_SECRET!) as {
      id: string
      sid: string
    }

    const user = await User.findOne({ _id: id })

    if (!user) {
      throw next(createHttpError(403))
    }

    const currentSession = await Session.findOne({ _id: sid })

    if (!currentSession) {
      throw next(createHttpError(403))
    }

    await Session.deleteOne({ _id: sid })

    const newSid = await Session.create({ uid: user._id })

    const payload = { id: user._id, sid: newSid._id }

    const tokens = this.getNewTokens(payload)

    res.json({ ...tokens })
  }

  logout = async (req: Request, res: Response) => {
    const { _id: ssid } = req.session

    await Session.deleteOne({ _id: ssid })

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
      expiresIn: '20h'
    })

    return { accessToken, refreshToken }
  }
}

export const AuthController = new Controller()
