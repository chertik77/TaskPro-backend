import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import type { Schema } from 'joi'

export const validateBody = (schema: Schema) => {
  const func = (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)

    if (error) {
      return next(new createHttpError.BadRequest(error.message))
    }

    next()
  }

  return func
}
