import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      session: string
      user: User
    }
  }
}
