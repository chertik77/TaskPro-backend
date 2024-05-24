import { Card } from '@/models/Card'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Board } from 'models/Board'
import { Column } from 'models/Column'

class Controller {
  add = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user

    const { columnId: column } = req.params

    const isCurrentColumn = await Column.findOne({ _id: column, owner })

    if (!isCurrentColumn) {
      return next(createHttpError(404, 'Column not found'))
    }

    const newCard = await Card.create({ ...req.body, column, owner })

    const columnWithCards = await Column.findOneAndUpdate(
      { _id: column, owner },
      { $push: { cards: newCard } }
    )

    await Board.updateOne(
      { owner, 'columns._id': columnWithCards?._id },
      {
        $set: {
          'columns.$.cards': columnWithCards?.cards
        }
      }
    )

    res.status(201).json(newCard)
  }

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user

    const { cardId: _id } = req.params

    const updatedCard = await Card.findOneAndUpdate({ _id, owner }, req.body)

    if (!updatedCard) {
      return next(createHttpError(404, 'Card not found'))
    }

    const columnWithCards = await Column.findOneAndUpdate(
      { owner, 'cards._id': _id },
      {
        $set: {
          'cards.$.title': updatedCard.title,
          'cards.$.description': updatedCard.description,
          'cards.$.priority': updatedCard.priority,
          'cards.$.deadline': updatedCard.deadline
        }
      }
    )
    await Board.updateOne(
      { owner, 'columns._id': columnWithCards?._id },
      {
        $set: {
          'columns.$.cards': columnWithCards?.cards
        }
      }
    )

    res.json(updatedCard)
  }

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user
    const { columnId: column, cardId: _id } = req.params

    const deletedCard = await Card.findOneAndDelete({ _id, column, owner })

    if (!deletedCard) {
      return next(createHttpError(404, 'Card not found'))
    }

    const columnWithCards = await Column.findOneAndUpdate(
      { _id: column, owner },
      { $pull: { cards: { _id, column, owner } } }
    )

    await Board.updateOne(
      { owner, 'columns._id': columnWithCards?._id },
      {
        $set: {
          'columns.$.cards': columnWithCards?.cards
        }
      }
    )

    res.json(deletedCard)
  }

  changeCardColumn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id: owner } = req.user
    const { columnId: column, cardId: _id, newColumnId } = req.params

    const card = await Card.findOneAndUpdate(
      { _id, column, owner },
      { column: newColumnId }
    )

    if (!card) {
      return next(createHttpError(404, 'Card not found'))
    }

    const delCardByOldColId = await Column.findOneAndUpdate(
      { _id: column, owner },
      { $pull: { cards: { _id, column, owner } } }
    )
    await Board.updateOne(
      { owner, 'columns._id': delCardByOldColId?._id },
      {
        $set: {
          'columns.$.cards': delCardByOldColId?.cards
        }
      }
    )

    const addCardByNewColId = await Column.findOneAndUpdate(
      { _id: newColumnId, owner },
      { $push: { cards: card } }
    )
    await Board.updateOne(
      { owner, 'columns._id': addCardByNewColId?._id },
      {
        $set: {
          'columns.$.cards': addCardByNewColId?.cards
        }
      }
    )

    res.json(card)
  }
}

export const cardController = new Controller()
