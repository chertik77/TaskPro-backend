import type { NextFunction, Request, Response } from 'express'

import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'

import { Session, User } from 'models'

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
    const { id, sid } = jwt.verify(token, process.env.ACCESS_JWT_SECRET!) as {
      id: string
      sid: string
    }

    const user = await User.findById(id)
    const session = await Session.findById(sid)

    if (!user || !session) {
      return next(createHttpError(401))
    }

    req.user = user.toObject()

    req.session = session._id

    next()
  } catch {
    return next(createHttpError(401))
  }
}
