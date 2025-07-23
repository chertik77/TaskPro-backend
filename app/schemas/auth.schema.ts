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

export const GoogleAuthSchema = z.object({
  code: z.string().nonempty('Code must be at least 1 character')
})
