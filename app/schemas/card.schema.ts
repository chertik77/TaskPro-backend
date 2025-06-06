import { Priority } from '@prisma/client'
import * as z from 'zod'

import { objectIdSchema, TitleSchema } from './shared.schema'

export const AddCardSchema = z.object({
  title: TitleSchema,
  description: TitleSchema,
  priority: z.nativeEnum(Priority, {
    message: 'Priority must be one of the following: Without, Low, Medium, High'
  }),
  deadline: z.coerce.date({ message: 'Invalid date format.' })
})

export const EditCardSchema = AddCardSchema.partial()

export const MoveCardSchema = z.object({
  cardId: objectIdSchema(),
  newColumnId: objectIdSchema()
})

export const CardParamsSchema = z.object({ cardId: objectIdSchema() })
