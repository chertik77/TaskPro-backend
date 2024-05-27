import { Session } from '@/models/Session'
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
    const { id, sid } = jwt.verify(token, JWT_SECRET!) as {
      id: string
      sid: string
    }

    const user = await User.findById(id)
    const session = await Session.findById(sid)

    if (!user || !session) {
      return next(createHttpError(401))
    }

    req.user = user.toObject({
      virtuals: true,
      transform(_, ret) {
        delete ret.password
        delete ret._id
      }
    })

    req.session = session._id

    next()
  } catch {
    return next(createHttpError(401))
  }
}
