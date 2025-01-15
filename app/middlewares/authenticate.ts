import type { NextFunction, Request, Response } from 'express'

import { prisma } from '@prisma'
import { Unauthorized } from 'http-errors'
import { verify } from 'jsonwebtoken'

export const authenticate = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const { authorization = '' } = req.headers
  const [bearer, token] = authorization.split(' ')

  if (bearer !== 'Bearer') return next(Unauthorized())

  try {
    const { id, sid } = verify(token, process.env.ACCESS_JWT_SECRET!) as {
      id: string
      sid: string
    }

    const user = await prisma.user.findFirst({ where: { id } })
    const session = await prisma.session.findFirst({ where: { id: sid } })

    if (!user || !session) return next(Unauthorized())

    req.user = user
    req.session = session.id

    next()
  } catch {
    return next(Unauthorized())
  }
}
