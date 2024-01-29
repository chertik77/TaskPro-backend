import bcrypt from 'bcryptjs'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { User } from 'models/User'

const JWT_SECRET = '4271136EE6185D15943C8ABF2AB75'

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (user) {
    return next(new createHttpError.Conflict('Email already exist'))
  }

  const hashPassword = await bcrypt.hash(password, 10)

  const newUser = await User.create({ ...req.body, password: hashPassword })

  res.status(201).json({
    username: newUser.username,
    email: newUser.email
  })
}

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    return next(new createHttpError.Conflict('Email or password invalid'))
  }

  const passwordCompare = await bcrypt.compare(password, user.password)
  if (!passwordCompare) {
    return next(new createHttpError.Conflict('Email already exist'))
  }

  const { _id: id } = user

  const payload = {
    id
  }

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  await User.findByIdAndUpdate(id, { accessToken, refreshToken })

  res.json({
    accessToken,
    refreshToken
  })
}

export const getCurrent = (req: Request, res: Response) => {
  const { username, email } = req.user

  res.json({
    username,
    email
  })
}

export const signout = async (req: Request, res: Response) => {
  const { _id } = req.user
  await User.findByIdAndUpdate(_id, { accessToken: '', refreshToken: '' })

  res.json({
    message: 'Signout success'
  })
}

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }

  try {
    const { id } = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload
    const user = await User.findOne({ refreshToken })
    if (!user) {
      return next(new createHttpError.Forbidden())
    }
    const payload = { id }
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
    const newRefreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
    await User.findByIdAndUpdate(id, {
      accessToken,
      refreshToken: newRefreshToken
    })

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    })
  } catch {
    return next(new createHttpError.Forbidden())
  }
}
