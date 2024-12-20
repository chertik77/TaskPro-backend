import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

export const validateRequest =
  <B extends z.ZodSchema, P extends z.ZodSchema, Q extends z.ZodSchema>({
    body,
    params,
    query
  }: {
    body?: B
    params?: P
    query?: Q
  }) =>
  (
    req: Request<z.infer<P>, unknown, z.infer<B>, z.infer<Q>>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (body) body.parse(req.body)

      if (params) params.parse(req.params)

      if (query) query.parse(req.query)

      next()
    } catch (e) {
      if (e instanceof z.ZodError) {
        const errors = Object.fromEntries(
          Object.entries(e.flatten().fieldErrors).map(([key, value]) => [
            key,
            value?.join(', ')
          ])
        )
        res.status(400).json({ statusCode: 400, messages: errors })
      }
    }
  }
