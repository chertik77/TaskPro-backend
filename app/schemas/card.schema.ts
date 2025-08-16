import { Priority } from '@prisma/client'
import * as z from 'zod'

import { objectIdSchema } from './object-id.schema'

export const AddCardSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  priority: z.enum(Priority),
  deadline: z.iso.datetime()
})

export const EditCardSchema = z
  .object({
    ...AddCardSchema.shape,
    columnId: objectIdSchema()
  })
  .partial()

export const CardParamsSchema = z.object({ cardId: objectIdSchema() })

export const UpdateCardOrderSchema = z.object({
  ids: z.array(objectIdSchema())
})
