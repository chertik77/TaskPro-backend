import { Priority } from '@prisma/client'
import * as z from 'zod'

import { objectIdSchema } from './object-id.schema'

export const AddTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  priority: z.enum(Priority),
  deadline: z.iso.datetime().refine(value => {
    return new Date(value) >= new Date()
  }, 'Deadline must be today or in the future')
})

export const EditTaskSchema = z
  .object({
    ...AddTaskSchema.shape,
    columnId: objectIdSchema()
  })
  .partial()

export const TaskParamsSchema = z.object({ taskId: objectIdSchema() })

export const UpdateTaskOrderSchema = z.object({
  ids: z.array(objectIdSchema())
})
