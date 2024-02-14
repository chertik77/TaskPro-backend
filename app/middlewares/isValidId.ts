import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { isValidObjectId } from 'mongoose'

export const isValidId = (req: Request, _: Response, next: NextFunction) => {
  const { boardId, columnId, cardId, newColumnId } = req.params

  if (boardId) {
    if (!isValidObjectId(boardId)) {
      return next(createHttpError(404, `${boardId} not valid id`))
    }
  }

  if (columnId) {
    if (!isValidObjectId(columnId)) {
      return next(createHttpError(404, `${columnId} not valid id`))
    }
  }

  if (cardId) {
    if (!isValidObjectId(cardId)) {
      return next(createHttpError(404, `${cardId} not valid id`))
    }
  }

  if (newColumnId) {
    if (!isValidObjectId(newColumnId)) {
      return next(createHttpError(404, `${newColumnId} not valid id`))
    }
  }

  next()
}
