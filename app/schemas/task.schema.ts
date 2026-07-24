import { z } from '@hono/zod-openapi'
import { Priority } from '@prisma/client'

import { LabelSchema } from './label.schema'
import { ObjectIdSchema } from './object-id.schema'

const TaskPrioritySchema = z.enum(Priority).openapi('TaskPriority')

export const TaskSchema = z
  .object({
    id: ObjectIdSchema,
    title: z.string().min(3).openapi({ example: 'Publication of the project' }),
    description: z.string().min(3).nullable().openapi({
      example:
        'Review the project materials: Familiarize yourself with the project...'
    }),
    priority: TaskPrioritySchema.openapi({ example: Priority.high }),
    deadline: z
      .date()
      .nullable()
      .openapi({ example: '2025-10-15T00:00:00.000Z' }),
    order: z.number().int().openapi({ example: 1 }),
    completed: z.boolean().openapi({ example: false }),
    completedAt: z.date().nullable().openapi({ example: null }),
    columnId: ObjectIdSchema,
    labels: z.array(LabelSchema),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .openapi('Task')

export const CreateTaskSchema = TaskSchema.pick({
  title: true,
  priority: true,
  description: true
}).extend({
  labels: z.optional(z.array(ObjectIdSchema)).openapi({
    description: 'Array of Label ids to attach to the task',
    example: ['6672fdccc07147fc7ae1bb93']
  }),
  deadline: z
    .optional(
      z.iso.datetime().refine(value => {
        const checkDate = new Date(value)
        const today = new Date()

        // Strip time down to the day level for fair comparison
        checkDate.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)

        return checkDate >= today
      }, 'Deadline must be today or in the future')
    )
    .transform(v => (v ? new Date(v) : null))
})

export const UpdateTaskSchema = z
  .object({
    ...CreateTaskSchema.shape,
    ...TaskSchema.pick({ completed: true }).shape,
    deadline: z.nullable(z.iso.datetime()).openapi({ example: '2025-10-15' }),
    columnId: ObjectIdSchema
  })
  .partial()

export const TaskParamsSchema = z.object({ taskId: ObjectIdSchema })

export const UpdateTasksOrderSchema = z.object({
  ids: z.array(ObjectIdSchema).openapi({
    example: ['6672fdccc07147fc7ae1bb93', '6743474be4006eca6c8122e7']
  })
})
