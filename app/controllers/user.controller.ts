import type { EditUserSchema, NeedHelpSchema } from '@/schemas'
import type { NextFunction, Request, Response } from 'express'
import type { TypedRequestBody } from 'zod-express-middleware'

import { userService } from '@/services'

import { redis } from '@/config'

import { assertHasUser } from '@/utils'

export const userController = {
  me: async (req: Request, res: Response) => {
    assertHasUser(req)

    const cacheKey = `users: ${req.user.id}`

    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      res.json(JSON.parse(cachedData))
    } else {
      const user = await userService.findById(req.user.id)

      await redis.set(cacheKey, JSON.stringify(user))

      res.json(user)
    }
  },

  update: async (
    req: TypedRequestBody<typeof EditUserSchema>,
    res: Response,
    next: NextFunction
  ) => {
    assertHasUser(req)

    try {
      const updatedUser = await userService.updateById(
        req.user,
        req.body,
        req.file
      )
      res.json(updatedUser)
    } catch (error) {
      next(error)
    }
  },

  help: async (
    { body }: TypedRequestBody<typeof NeedHelpSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await userService.sendHelpRequest(body)
      res.json({ message: 'Email sent' })
    } catch (error) {
      next(error)
    }
  }
}
