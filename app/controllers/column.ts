import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Column } from 'models/Column'
import { Board } from 'models/Board'

//! Add new column
export const add = async (req: Request, res: Response, next: NextFunction) => {
  const { _id: owner } = req.user
  const { boardName: board } = req.params

  const isCurrentBoard = await Board.findOne({ title: board, owner })
  if (!isCurrentBoard) {
    return next(createHttpError(404, `Board ${board} not found`))
  }

  const newColumn = await Column.create({ ...req.body, board, owner })

  await Board.updateOne(
    { title: board, owner },
    { $push: { columns: newColumn } }
  )

  res.status(201).json(newColumn)
}

//! Edit column
export const updateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: board, columnId: _id } = req.params

  const updatedColumn = await Column.findOneAndUpdate(
    { _id, board, owner },
    req.body,
    { fields: '-tasks' }
  )

  if (!updatedColumn) {
    return next(createHttpError(404, 'Column not found'))
  }

  await Board.updateOne(
    { title: board, owner, 'columns._id': _id },
    {
      $set: {
        'columns.$.title': updatedColumn.title
      }
    }
  )

  res.json(updatedColumn)
}

//!Delete column
export const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: board, columnId: _id } = req.params

  const deletedColumn = await Column.findOneAndDelete({
    _id,
    board,
    owner
  }).select('-tasks')

  if (!deletedColumn) {
    return next(createHttpError(404, 'Column not found'))
  }

  await Board.updateOne(
    { title: board, owner },
    {
      $pull: { columns: { _id, board, owner } }
    }
  )

  res.json(deletedColumn)
}
