import * as z from 'zod'

export const AddColumnSchema = z.object({ title: z.string().min(3) })

export const EditColumnSchema = AddColumnSchema.partial()

export const ColumnParams = z.object({ columnId: z.string() })
