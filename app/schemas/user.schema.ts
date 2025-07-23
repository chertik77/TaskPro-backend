import { Theme } from '@prisma/client'
import * as z from 'zod'

import { SignupSchema } from './auth.schema'

export const NeedHelpSchema = z.object({
  email: z.string().email({ message: 'Email is invalid' }),
  comment: z.string().min(5, 'Comment must be at least 5 characters')
})

export const EditUserSchema = SignupSchema.extend({
  theme: z.nativeEnum(Theme, {
    message: 'Theme must be one of the following: light, dark, violet'
  })
}).partial()
