import * as z from 'zod'

import { objectIdSchema } from './object-id.schema'

export const CreateColumnSchema = z.object({
  title: z.string().min(3)
})

export const UpdateColumnSchema = CreateColumnSchema.partial()

export const ColumnParamsSchema = z.object({ columnId: objectIdSchema() })

export const UpdateColumnOrderSchema = z.object({
  ids: z.array(objectIdSchema())
})
