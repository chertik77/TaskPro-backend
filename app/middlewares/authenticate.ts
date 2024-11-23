import type { NextFunction, Request, Response } from 'express'

import { prisma } from 'app'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'

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

    const user = await prisma.user.findFirst({ where: { id } })
    const session = await prisma.session.findFirst({ where: { id: sid } })

    if (!user || !session) {
      return next(createHttpError(401))
    }

    req.user = user
    req.session = session.id

    next()
  } catch {
    return next(createHttpError(401))
  }
}
