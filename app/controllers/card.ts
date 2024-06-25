import type { NextFunction, Request, Response } from 'express'

import createHttpError from 'http-errors'

import { Card } from 'models/Card'
import { Column } from 'models/Column'

export const cardController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
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
  },

  updateById: async (req: Request, res: Response, next: NextFunction) => {
    const updatedCard = await Card.findOneAndUpdate(
      { _id: req.params.cardId },
      req.body
    )

    if (!updatedCard) {
      return next(createHttpError(404, 'Card not found'))
    }

    res.json(updatedCard)
  },

  deleteById: async (req: Request, res: Response, next: NextFunction) => {
    const deletedCard = await Card.findByIdAndDelete(req.params.cardId)

    if (!deletedCard) {
      return next(createHttpError(404, 'Card not found'))
    }

    res.status(204).send()
  },

  changeCardColumn: async (req: Request, res: Response, next: NextFunction) => {
    const { newColumnId, cardId } = req.params

    const existColumn = await Column.findById(newColumnId)

    if (!existColumn) {
      return next(createHttpError(404, 'Column Not Found'))
    }

    const result = await Card.findOneAndUpdate(
      { _id: cardId, owner: req.user.id },
      { column: newColumnId }
    )

    if (!result) {
      return next(createHttpError(404, 'Card Not Found'))
    }

    res.json(result)
  }
}
