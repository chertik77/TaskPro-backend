import { z } from '@hono/zod-openapi'

import { ObjectIdSchema } from './object-id.schema'
import { TaskSchema } from './task.schema'

export const ColumnSchema = z
  .object({
    id: ObjectIdSchema,
    title: z.string().min(3).openapi({ example: 'In progress' }),
    order: z.number().int().openapi({ example: 1 }),
    boardId: ObjectIdSchema,
    tasks: z.array(TaskSchema),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .openapi('Column')

export const CreateColumnSchema = ColumnSchema.pick({
  title: true
})

export const UpdateColumnSchema = CreateColumnSchema.partial()

export const ColumnParamsSchema = z.object({ columnId: ObjectIdSchema })

export const UpdateColumnsOrderSchema = z.object({
  ids: z.array(ObjectIdSchema).openapi({
    example: ['6672fdccc07147fc7ae1bb93', '6743474be4006eca6c8122e7']
  })
})
