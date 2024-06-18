import { priorities } from '@/constants/priorities'
import * as z from 'zod'

export const AddCardSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  priority: z.enum(priorities),
  deadline: z.coerce.date()
})

export const EditCardSchema = AddCardSchema.partial()
