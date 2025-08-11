import { Priority } from '@prisma/client'
import * as z from 'zod'

import { objectIdSchema } from './object-id.schema'

export const AddCardSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  priority: z.enum(
    Priority,
    `Priority must be one of the following: ${Object.values(Priority).join(',')}`
  ),
  deadline: z.iso.datetime('Deadline must be a valid datetime')
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
