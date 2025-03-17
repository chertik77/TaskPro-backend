import type { NextFunction, Request, Response } from 'express'

import { Unauthorized } from 'http-errors'
import { verify } from 'jsonwebtoken'

import { prisma } from '@/config/prisma'

import { env } from '@/utils'

export const authenticate = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const { authorization = '' } = req.headers
  const [bearer, token] = authorization.split(' ')

  if (bearer !== 'Bearer') return next(Unauthorized())

  try {
    const { id, sid } = verify(token, env.ACCESS_JWT_SECRET) as {
      id: string
      sid: string
    }

    const user = await prisma.user.findFirst({
      where: { id },
      omit: { password: false }
    })

    const session = await prisma.session.findFirst({ where: { id: sid } })

    if (!user || !session) return next(Unauthorized())

    req.user = user
    req.session = session.id

    next()
  } catch {
    return next(Unauthorized())
  }
}
