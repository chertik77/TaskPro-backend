import * as z from 'zod'

import { objectIdSchema } from './object-id.schema'

export const AddColumnSchema = z.object({
  title: z.string().min(3)
})

export const EditColumnSchema = AddColumnSchema.partial()

export const ColumnParamsSchema = z.object({ columnId: objectIdSchema() })

export const UpdateColumnOrderSchema = z.object({
  ids: z.array(objectIdSchema())
})
