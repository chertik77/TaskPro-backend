import { Theme } from '@prisma/client'
import * as z from 'zod'

export const NeedHelpSchema = z.object({
  email: z.email('Email is invalid'),
  comment: z.string().min(5, 'Comment must be at least 5 characters')
})

export const EditUserSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Email is invalid'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password must be at most 64 characters'),
    theme: z.enum(
      Theme,
      'Theme must be one of the following: light, dark, violet'
    )
  })
  .partial()
