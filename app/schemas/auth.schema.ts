import * as z from 'zod'

export const SigninSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(64)
})

export const SignupSchema = z.object({
  ...SigninSchema.shape,
  name: z.string().min(2)
})

export const GoogleCodeSchema = z.object({
  code: z.string().min(1),
  state: z.optional(z.string())
})
