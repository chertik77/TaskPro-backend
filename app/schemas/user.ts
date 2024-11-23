import { Theme } from '@prisma/client'
import * as z from 'zod'

export const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64)
})

export const SignupSchema = SigninSchema.extend({
  name: z.string().min(2)
})

export const EditUserSchema = SignupSchema.partial()

export const NeedHelpSchema = z.object({
  email: z.string().email(),
  comment: z.string().min(5)
})

export const ThemeSchema = z.object({ theme: z.nativeEnum(Theme) })

export const RefreshTokenSchema = z.object({ refreshToken: z.string() })

export const GoogleAuthSchema = z.object({ code: z.string() })
