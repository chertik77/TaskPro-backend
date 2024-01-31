import bcrypt from 'bcrypt'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { User } from 'models/User'

const { JWT_SECRET } = process.env

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

  const newUser = await User.create({
    ...req.body,
    password: hashPassword
  })

  res.status(201).json({
    user: {
      name: newUser.name,
      email: newUser.email
    }
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
    return next(new createHttpError.Unauthorized('Email or password invalid'))
  }

  const passwordCompare = await bcrypt.compare(password, user.password)
  if (!passwordCompare) {
    return next(new createHttpError.Unauthorized('Email or password invalid'))
  }

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }

  const { _id: id } = user
  const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '1d' })
  const activeUser = await User.findByIdAndUpdate(id, { token })

  res.json({
    token,
    user: {
      name: activeUser?.name,
      email: activeUser?.email
    }
  })
}

export const getCurrent = (req: Request, res: Response) => {
  const { name, email } = req.user

  res.json({
    name,
    email
  })
}

export const signout = async (req: Request, res: Response) => {
  const { _id } = req.user
  await User.findByIdAndUpdate(_id, { token: '' })

  res.status(204).json({
    message: 'Signout success'
  })
}
