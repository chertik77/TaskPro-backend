import { Card } from '@/models/Card'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Column } from 'models/Column'

class Controller {
  add = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user

    const { columnId: column } = req.params

    const isCurrentColumn = await Column.findOne({ _id: column, owner })

    if (!isCurrentColumn) {
      return next(createHttpError(404, 'Column not found'))
    }

    const newCard = await Card.create({
      ...req.body,
      owner,
      column,
      board: isCurrentColumn.board
    })

    res.status(201).json(newCard)
  }

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    const { cardId: _id } = req.params

    const updatedCard = await Card.findOneAndUpdate({ _id }, req.body)

    if (!updatedCard) {
      return next(createHttpError(404, 'Card not found'))
    }

    res.json(updatedCard)
  }

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    const { cardId: _id } = req.params

    const deletedCard = await Card.findOneAndDelete({ _id })

    if (!deletedCard) {
      return next(createHttpError(404, 'Card not found'))
    }

    res.status(204).json({})
  }

  changeCardColumn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id: owner } = req.user

    const { cardId: _id, newColumnId } = req.params

    const existColumn = await Column.findById(newColumnId)

    if (!existColumn) {
      return next(createHttpError(404, 'Column Not Found'))
    }

    const result = await Card.findOneAndUpdate(
      { _id, owner },
      { column: newColumnId },
      { new: true }
    )

    if (!result) {
      return next(createHttpError(404, 'Card Not Found'))
    }

    res.json(result)
  }
}

export const cardController = new Controller()
