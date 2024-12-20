import type { NextFunction, Request, Response } from 'express'

import * as z from 'zod'

type ValidateRequest<B, P, Q> = {
  body?: B
  params?: P
  query?: Q
}

export const validateRequest =
  <B extends z.ZodSchema, P extends z.ZodSchema, Q extends z.ZodSchema>({
    body: bodySchema,
    params: paramsSchema,
    query: querySchema
  }: ValidateRequest<B, P, Q>) =>
  (
    req: Request<z.infer<P>, unknown, z.infer<B>, z.infer<Q>>,
    res: Response,
    next: NextFunction
  ) => {
    const errors: Record<string, string> = {}

    const parseAndValidate = <T extends z.ZodSchema>(
      data: Pick<Request, 'body' | 'params' | 'query'>,
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
    parseAndValidate(req.query, querySchema)

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ statusCode: 400, messages: errors })
    }

    next()
  }
