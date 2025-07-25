import { Priority } from '@prisma/client'
import * as z from 'zod'

import { objectIdSchema } from './object-id.schema'

export const AddCardSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  priority: z.nativeEnum(Priority, {
    message: 'Priority must be one of the following: Without, Low, Medium, High'
  }),
  deadline: z.coerce.date({ message: 'Deadline must be a valid date' })
})

export const EditCardSchema = AddCardSchema.extend({
  columnId: objectIdSchema()
}).partial()

export const CardParamsSchema = z.object({ cardId: objectIdSchema() })

export const UpdateCardOrderSchema = z.object({
  ids: z.array(objectIdSchema())
})
