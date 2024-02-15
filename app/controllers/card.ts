import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Card } from '@/models/Card'
import { Column } from 'models/Column'
import { Board } from 'models/Board'

//! Add new card
export const add = async (req: Request, res: Response, next: NextFunction) => {
  const { _id: owner } = req.user
  const { boardId: board, columnId: column } = req.params

  const isCurrentColumn = await Column.findOne({ _id: column, board, owner })
  if (!isCurrentColumn) {
    return next(createHttpError(404, 'Column not found'))
  }

  const newCard = await Card.create({ ...req.body, column, board, owner })

  const columnWithCards = await Column.findOneAndUpdate(
    { _id: column, board, owner },
    { $push: { cards: newCard } }
  )
  await Board.updateOne(
    { _id: board, owner, 'columns._id': columnWithCards?._id },
    {
      $set: {
        'columns.$.cards': columnWithCards?.cards
      }
    }
  )

  res.status(201).json(newCard)
}

//! Edit card
export const updateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardId: board, columnId: column, cardId: _id } = req.params

  const updatedCard = await Card.findOneAndUpdate(
    { _id, column, board, owner },
    req.body
  )

  if (!updatedCard) {
    return next(createHttpError(404, 'Card not found'))
  }

  const columnWithCards = await Column.findOneAndUpdate(
    { _id: column, board, owner, 'cards._id': _id },
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
    { _id: board, owner, 'columns._id': columnWithCards?._id },
    {
      $set: {
        'columns.$.cards': columnWithCards?.cards
      }
    }
  )

  res.json(updatedCard)
}

//! Delete card
export const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardId: board, columnId: column, cardId: _id } = req.params

  const deletedCard = await Card.findOneAndDelete({
    _id,
    column,
    board,
    owner
  })

  if (!deletedCard) {
    return next(createHttpError(404, 'Card not found'))
  }

  const columnWithCards = await Column.findOneAndUpdate(
    { _id: column, board, owner },
    { $pull: { cards: { _id, column, board, owner } } }
  )
  await Board.updateOne(
    { _id: board, owner, 'columns._id': columnWithCards?._id },
    {
      $set: {
        'columns.$.cards': columnWithCards?.cards
      }
    }
  )

  res.json(deletedCard)
}

//! Change column for card
export const changeCardColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const {
    boardId: board,
    columnId: column,
    cardId: _id,
    newColumnId
  } = req.params

  const card = await Card.findOneAndUpdate(
    { _id, column, board, owner },
    { column: newColumnId }
  )

  if (!card) {
    return next(createHttpError(404, 'Card not found'))
  }

  const delCardByOldColId = await Column.findOneAndUpdate(
    { _id: column, board, owner },
    { $pull: { cards: { _id, column, board, owner } } }
  )
  await Board.updateOne(
    { _id: board, owner, 'columns._id': delCardByOldColId?._id },
    {
      $set: {
        'columns.$.cards': delCardByOldColId?.cards
      }
    }
  )

  const addCardByNewColId = await Column.findOneAndUpdate(
    { _id: newColumnId, board, owner },
    { $push: { cards: card } }
  )
  await Board.updateOne(
    { _id: board, owner, 'columns._id': addCardByNewColId?._id },
    {
      $set: {
        'columns.$.cards': addCardByNewColId?.cards
      }
    }
  )

  res.json({...card, oldColumn: column})
}
