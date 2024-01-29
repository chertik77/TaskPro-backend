import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { User } from 'models/User'

const JWT_SECRET = '4271136EE6185D15943C8ABF2AB75'

export const authenticate = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const { authorization = '' } = req.headers
  const [bearer, accessToken] = authorization.split(' ')
  if (bearer !== 'Bearer') {
    return next(new createHttpError.Unauthorized())
  }

  try {
    const { id } = jwt.verify(accessToken, JWT_SECRET as string) as {
      id: string
    }
    const user = await User.findById(id)
    if (!user || !user.accessToken) {
      return next(new createHttpError.Unauthorized())
    }
    req.user = user.toObject()
    next()
  } catch {
    return next(new createHttpError.Unauthorized())
  }
}
