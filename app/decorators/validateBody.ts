import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import type { Schema } from 'joi'

export const validateBody = (schema: Schema) => {
  const func = (req: Request, res: Response, next: NextFunction) => {
    const { length } = Object.keys(req.body)
    if (!length) {
      return next(createHttpError(400, 'missing fields'))
    }

    const { error } = schema.validate(req.body)

    if (error) {
      return next(createHttpError(400, error.message))
    }

    next()
  }

  return func
}
