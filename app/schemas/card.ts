import { Priority } from '@prisma/client'
import * as z from 'zod'

import { zodObjectId } from './board'

export const AddCardSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  priority: z.nativeEnum(Priority),
  deadline: z.coerce.date()
})

export const EditCardSchema = AddCardSchema.partial()

export const CardParamsSchema = z.object({ cardId: zodObjectId() })
