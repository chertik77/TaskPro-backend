import { Types } from 'mongoose'

declare global {
  namespace Express {
    export interface Request {
      session: Types.ObjectId
      user: {
        id: string
        name: string
        email: string
        avatar: {
          url: string
          publicId: string
        }
        theme: string
      }
    }
  }
}

export {}
