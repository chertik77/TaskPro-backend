import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { isValidObjectId } from 'mongoose'

export const isValidId = (req: Request, _: Response, next: NextFunction) => {
  const { id } = req.params

  if (!isValidObjectId(id)) {
    return next(new createHttpError.NotFound(`${id} not valid id`))
  }

  next()
}
