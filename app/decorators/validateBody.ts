import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import type { Schema } from 'joi'

export const validateBody = (schema: Schema) => {
  const func = (req: Request, _: Response, next: NextFunction) => {
    const { length } = Object.keys(req.body)
    if (!length && !req.file) {
      return next(createHttpError(400, 'Any data not found'))
    }

    const { error } = schema.validate(req.body)

    if (error) {
      return next(createHttpError(400, error.message))
    }

    next()
  }

  return func
}
