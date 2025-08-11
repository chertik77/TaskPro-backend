import * as z from 'zod'

export const SigninSchema = z.object({
  email: z.email('Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters')
})

export const SignupSchema = z.object({
  ...SigninSchema.shape,
  name: z.string().min(2, 'Name must be at least 2 characters')
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

export const GoogleCodeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  state: z.optional(z.string())
})
