import bcrypt from 'bcrypt'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { User } from 'models/User'

const { JWT_SECRET } = process.env

class Controller {
  signup = async (req: Request, res: Response, next: NextFunction) => {
    const isUserExists = await User.findOne({ email: req.body.email })

    if (isUserExists) {
      return next(createHttpError(409, 'Email already exist'))
    }

    const { id } = await User.create({
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10)
    })

    const token = jwt.sign({ id }, JWT_SECRET as jwt.Secret, {
      expiresIn: '7d'
    })

    const user = await User.findByIdAndUpdate(id, { token })

    res.status(201).json({ token: user?.token, user })
  }

  signin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    console.log(user)
    if (!user) {
      return next(createHttpError(401, 'Email or password invalid'))
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return next(createHttpError(401, 'Email or password invalid'))
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET as jwt.Secret, {
      expiresIn: '7d'
    })

    const activeUser = await User.findByIdAndUpdate(user.id, { token })

    res.json({ token: activeUser?.token, user })
  }

  current = (req: Request, res: Response) => {
    res.json({ ...req.user, avatar: req.user.avatar.url })
  }

  logout = async (req: Request, res: Response) => {
    await User.findByIdAndUpdate(req.user.id, { token: '' })

    res.status(204).json({})
  }
}

export const AuthController = new Controller()
