import type { NextFunction, Request, Response } from 'express'

import { Unauthorized } from 'http-errors'

export const authenticate = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    if (!req.user)
      req.logOut(err => {
        if (err) return next(err)
      })
    else return next()
  }

  return next(Unauthorized())
}
