import type { RequestHandler } from 'express'
import type * as z from 'zod'

import createHttpError from 'http-errors'

type RequestValidation<P, Q, B> = {
  params?: z.ZodType<P>
  query?: z.ZodType<Q>
  body?: z.ZodType<B>
}

export const validateRequest: <P, Q, B>(
  schemas: RequestValidation<P, Q, B>
) => RequestHandler<P, unknown, B, Q> =
  ({ params, query, body }) =>
  (req, _, next) => {
    const errors: Record<string, string> = {}

    if (params) {
      const parsed = params.safeParse(req.params)

      if (!parsed.success) {
        parsed.error.issues.forEach(({ path, message }) => {
          const errorPath = `${path.join('.')}`
          errors[errorPath] = message
        })
      }
    }

    if (query) {
      const parsed = query.safeParse(req.query)

      if (!parsed.success) {
        parsed.error.issues.forEach(({ path, message }) => {
          const errorPath = `${path.join('.')}`
          errors[errorPath] = message
        })
      }
    }

    if (body) {
      const parsed = body.safeParse(req.body)

      if (!parsed.success) {
        parsed.error.issues.forEach(({ path, message }) => {
          const errorPath = `${path.join('.')}`
          errors[errorPath] = message
        })
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(createHttpError(400, { message: errors }))
    }

    return next()
  }
