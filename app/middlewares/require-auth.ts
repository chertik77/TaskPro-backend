import type { NextFunction, Request, Response } from 'express'

import { auth } from '@/lib'
import { fromNodeHeaders } from 'better-auth/node'
import { Unauthorized } from 'http-errors'

export const requireAuth = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    })

    if (!session) return next(Unauthorized())

    req.user = session.user
    req.session = session.session

    next()
  } catch {
    return next(Unauthorized())
  }
}
