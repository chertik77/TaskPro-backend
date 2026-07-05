import { LabelColor } from '@prisma/client'
import * as z from 'zod'

import { objectIdSchema } from './object-id.schema'

export const CreateLabelSchema = z.object({
  name: z.string().min(2),
  color: z.enum(LabelColor)
})

export const UpdateLabelSchema = CreateLabelSchema.partial()

export const LabelParamsSchema = z.object({ labelId: objectIdSchema() })
