import { Priority } from '@prisma/client'
import * as z from 'zod'

import { objectIdSchema } from './object-id.schema'

export const AddTaskSchema = z.object({
  title: z.string().min(3),
  description: z.optional(z.string().min(3)),
  priority: z.enum(Priority),
  labels: z.optional(z.array(objectIdSchema())),
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

export const EditTaskSchema = z
  .object({
    ...AddTaskSchema.shape,
    completed: z.boolean(),
    description: z.nullable(z.string().min(3)),
    deadline: z.nullable(z.iso.datetime()),
    columnId: objectIdSchema()
  })
  .partial()

export const TaskParamsSchema = z.object({ taskId: objectIdSchema() })

export const UpdateTaskOrderSchema = z.object({
  ids: z.array(objectIdSchema())
})
