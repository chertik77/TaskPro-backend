import type { User } from '@prisma/client'
import type { Request } from 'express'

type RequestWithUser = Request & { user: User }

export function assertHasUser(req: Request): asserts req is RequestWithUser {
  if (!('user' in req)) {
    throw new Error('Request object without user found unexpectedly')
  }
}
