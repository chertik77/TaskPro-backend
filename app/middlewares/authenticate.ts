import type { JwtPayload } from '@/types'
import type { NextFunction, Request, Response } from 'express'

import { prisma } from '@/prisma'
import { Unauthorized } from 'http-errors'
import { jwtVerify } from 'jose'

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
    const {
      payload: { id, sid }
    } = await jwtVerify<JwtPayload>(token, env.ACCESS_JWT_SECRET)

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
