import * as z from 'zod'

import { TitleSchema, zodObjectId } from './board'

export const AddColumnSchema = z.object({ title: TitleSchema })

export const EditColumnSchema = AddColumnSchema.partial()

export const ColumnParamsSchema = z.object({ columnId: zodObjectId() })
