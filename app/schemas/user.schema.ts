import { Theme } from '@prisma/client'
import * as z from 'zod'

export const SigninSchema = z.object({
  email: z.string().email({ message: 'Email is invalid' }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters')
})

export const SignupSchema = SigninSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters')
})

export const NeedHelpSchema = z.object({
  email: SigninSchema.shape.email,
  comment: z.string().min(5, 'Comment must be at least 5 characters')
})

export const EditUserSchema = SignupSchema.extend({
  theme: z.nativeEnum(Theme, {
    message: 'Theme must be one of the following: light, dark, violet'
  })
}).partial()

export const RefreshTokenSchema = z.object({
  refreshToken: z.string()
})

export const GoogleAuthSchema = z.object({
  code: z.string()
})
