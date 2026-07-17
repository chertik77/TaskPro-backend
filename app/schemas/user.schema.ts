import * as z from 'zod'

export const NeedHelpSchema = z.object({
  email: z.email(),
  comment: z.string().min(5)
})

export const UpdateUserSchema = z
  .object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8).max(64)
  })
  .partial()
