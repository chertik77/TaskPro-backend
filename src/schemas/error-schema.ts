import { z } from '@hono/zod-openapi'

export const ErrorResponseSchema = z
  .object({
    status: z.number().openapi({ example: 400 }),
    message: z.union([z.string(), z.record(z.string(), z.array(z.string()))]),
    errors: z
      .record(z.string(), z.array(z.string()))
      .optional()
      .openapi({ description: 'Per-field validation messages' })
  })
  .openapi('ErrorResponse')

export const BadRequestResponse = {
  description: 'Bad Request',
  content: {
    'application/json': {
      schema: ErrorResponseSchema.openapi({
        example: {
          status: 400,
          message: 'Validation failed',
          errors: { title: ['The field must be at least 3'] }
        }
      })
    }
  }
}

export const UnauthorizedResponse = {
  description: 'Unauthorized',
  content: {
    'application/json': {
      schema: ErrorResponseSchema.openapi({
        example: { status: 401, message: 'Unauthorized' }
      })
    }
  }
}

export const NotFoundResponse = {
  description: 'Not Found',
  content: {
    'application/json': {
      schema: ErrorResponseSchema.openapi({
        example: { status: 404, message: 'Not found' }
      })
    }
  }
}
