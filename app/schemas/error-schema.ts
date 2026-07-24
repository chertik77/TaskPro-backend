import { z } from '@hono/zod-openapi'

export const ErrorResponseSchema = z
  .object({
    status: z.number().openapi({ example: 400 }),
    message: z.union([z.string(), z.record(z.string(), z.array(z.string()))])
  })
  .openapi('ErrorResponse')

export const BadRequestResponse = {
  description: 'Bad Request',
  content: {
    'application/json': {
      schema: ErrorResponseSchema.openapi({
        example: { status: 400, message: 'Validation failed' }
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

export const ConflictResponse = {
  description: 'Conflict',
  content: {
    'application/json': {
      schema: ErrorResponseSchema.openapi({
        example: {
          status: 409,
          message: 'Provided email already exists'
        }
      })
    }
  }
}
