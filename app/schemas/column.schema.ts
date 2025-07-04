import * as z from 'zod'

import { objectIdSchema } from './object-id.schema'

export const AddColumnSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters')
})

export const EditColumnSchema = AddColumnSchema.partial()

export const ColumnParamsSchema = z.object({ columnId: objectIdSchema() })
