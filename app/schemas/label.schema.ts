import { AccentColor } from '@prisma/client'
import * as z from 'zod'

import { objectIdSchema } from './object-id.schema'

export const CreateLabelSchema = z.object({
  name: z.string().min(2),
  description: z.optional(z.string().min(3)),
  color: z.enum(AccentColor)
})

export const UpdateLabelSchema = CreateLabelSchema.partial()

export const LabelParamsSchema = z.object({ labelId: objectIdSchema() })
