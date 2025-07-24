import type { NextFunction, Request, Response } from 'express'
import type { HttpError } from 'http-errors'

export const notFoundHandler = (_: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' })
}

export const globalErrorHandler = (
  err: HttpError,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  const { status = 500, message = 'Server error' } = err
  res.status(status).json({ statusCode: status, message })
}
