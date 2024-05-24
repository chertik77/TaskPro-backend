import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { User } from 'models/User'

const { JWT_SECRET } = process.env

export const authenticate = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const { authorization = '' } = req.headers
  const [bearer, token] = authorization.split(' ')

  if (bearer !== 'Bearer') {
    return next(createHttpError(401))
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET as string) as { id: string }

    const user = await User.findById(id)

    if (!user || !user.token || token !== user.token) {
      return next(createHttpError(401))
    }

    req.user = user.toObject({
      virtuals: true,
      transform(_, ret) {
        delete ret.password
        delete ret._id
      }
    })

    next()
  } catch {
    return next(createHttpError(401))
  }
}
