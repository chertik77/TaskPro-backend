import { Priority } from '@prisma/client'
import * as z from 'zod'

export const AddCardSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  priority: z.nativeEnum(Priority),
  deadline: z.coerce.date()
})

export const EditCardSchema = AddCardSchema.partial()

export const CardParamsSchema = z.object({ cardId: z.string() })

export const UpdateCardOrderSchema = z.object({
  ids: z.array(z.string())
})
