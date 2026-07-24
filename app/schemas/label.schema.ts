import { AccentColor } from '@prisma/client'
import * as z from 'zod'

import { ErrorResponseSchema } from './error-schema'
import { ObjectIdSchema } from './object-id.schema'
import { AccentColorSchema } from './settings.schema'

export const LabelSchema = z
  .object({
    id: ObjectIdSchema,
    name: z.string().openapi({ example: 'Bug' }),
    description: z
      .string()
      .min(3)
      .nullable()
      .openapi({ example: 'Description of the bug' }),
    color: AccentColorSchema.openapi({ example: AccentColor.red }),
    userId: ObjectIdSchema,
    taskIds: z.array(ObjectIdSchema).openapi({ example: [] }),
    createdAt: z.date().openapi({ example: '2026-06-29T14:30:00.000Z' }),
    updatedAt: z.date().openapi({ example: '2026-06-29T14:30:00.000Z' })
  })
  .openapi('Label')

export const CreateLabelSchema = LabelSchema.pick({
  name: true,
  color: true
})

export const UpdateLabelSchema = LabelSchema.pick({
  name: true,
  color: true,
  description: true
}).partial()

export const LabelParamsSchema = z.object({ labelId: ObjectIdSchema })

export const LabelConflictResponse = {
  description: 'Conflict',
  content: {
    'application/json': {
      schema: ErrorResponseSchema.openapi({
        example: { status: 409, message: 'Label with same name already exists' }
      })
    }
  }
}
