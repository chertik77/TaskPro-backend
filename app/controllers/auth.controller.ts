import type { NextFunction, Request, Response } from 'express'

import { userService } from '@/services'

import { assertHasUser } from '@/utils'

export const authController = {
  signup: async (req: Request, res: Response) => {
    assertHasUser(req)

    const user = await userService.findById(req.user.id)

    res.json({ user })
  },

  signin: async (req: Request, res: Response) => {
    assertHasUser(req)

    const user = await userService.findById(req.user.id)

    res.json({ user })
  },

  // google = async (
  //   _: TypedRequestBody<typeof GoogleAuthSchema>,
  //   res: Response
  // ) => {
  //   res.sendStatus(200)
  // }

  logout: async (req: Request, res: Response, next: NextFunction) => {
    req.logout(err => {
      if (err) return next(err)
      res.status(204).send()
    })
  }
}
