import * as z from 'zod'

import { objectIdSchema, TitleSchema } from './shared.schema'

export const AddColumnSchema = z.object({ title: TitleSchema })

export const EditColumnSchema = AddColumnSchema.partial()

export const ColumnParamsSchema = z.object({ columnId: objectIdSchema() })
