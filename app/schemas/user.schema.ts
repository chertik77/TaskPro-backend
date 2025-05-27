import { Theme } from '@prisma/client'
import * as z from 'zod'

export const SigninSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string'
    })
    .email({ message: 'Email is invalid' }),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string'
    })
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters')
})

export const SignupSchema = SigninSchema.extend({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string'
    })
    .min(2, 'Name must be at least 2 characters')
})

export const NeedHelpSchema = z.object({
  email: SigninSchema.shape.email,
  comment: z
    .string({
      required_error: 'Comment is required',
      invalid_type_error: 'Comment must be a string'
    })
    .min(5, 'Comment must be at least 5 characters')
})

export const EditUserSchema = SignupSchema.extend({
  theme: z.nativeEnum(Theme, {
    message: 'Theme must be one of the following: light, dark, violet'
  })
}).partial()

export const RefreshTokenSchema = z.object({
  refreshToken: z.string({
    required_error: 'refreshToken is required',
    invalid_type_error: 'refreshToken must be a string'
  })
})

export const GoogleAuthSchema = z.object({
  code: z.string({
    required_error: 'Code is required',
    invalid_type_error: 'Code must be a string'
  })
})
