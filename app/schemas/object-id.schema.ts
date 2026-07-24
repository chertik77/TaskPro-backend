import { z } from '@hono/zod-openapi'

export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/, 'The field must have a valid ObjectId format')
  .openapi({
    format: 'objectid',
    example: '6672fdccc07147fc7ae1bb93'
  })
