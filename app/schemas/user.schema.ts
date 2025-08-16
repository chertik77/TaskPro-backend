import { Theme } from '@prisma/client'
import * as z from 'zod'

export const NeedHelpSchema = z.object({
  email: z.email(),
  comment: z.string().min(5)
})

export const EditUserSchema = z
  .object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8).max(64),
    theme: z.enum(Theme)
  })
  .partial()
