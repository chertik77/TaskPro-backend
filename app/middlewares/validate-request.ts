import type { NextFunction, Request, Response } from 'express'

import createHttpError from 'http-errors'
import * as z from 'zod'

type ValidateRequest<B, P> = {
  body?: B
  params?: P
}

export const validateRequest =
  <B extends z.ZodSchema, P extends z.ZodSchema>({
    body: bodySchema,
    params: paramsSchema
  }: ValidateRequest<B, P>) =>
  (
    req: Request<z.infer<P>, unknown, z.infer<B>, unknown>,
    _: Response,
    next: NextFunction
  ) => {
    const errors: Record<string, string> = {}

    const parseAndValidate = <T extends z.ZodSchema>(
      data: Pick<Request, 'body' | 'params'>,
      schema?: T
    ) => {
      if (!schema) return data

      try {
        return schema.parse(data)
      } catch (e) {
        if (e instanceof z.ZodError) {
          e.errors.forEach(({ path, message }) => {
            const errorPath = `${path.join('.')}`
            errors[errorPath] = message
          })
        }
      }
    }

    parseAndValidate(req.body, bodySchema)
    parseAndValidate(req.params, paramsSchema)

    if (Object.keys(errors).length > 0) {
      return next(createHttpError(400, { message: errors }))
    }

    next()
  }
