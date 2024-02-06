import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Column } from 'models/Column'
import { Board } from 'models/Board'

//! Get all columns
export const getAll = async (req: Request, res: Response) => {
  const { _id: owner } = req.user
  const { boardName: board } = req.params

  const columns = await Column.find({ board, owner }, '-tasks').populate(
    'owner',
    ['name', 'email', 'userTheme']
  )

  res.json({
    total: columns.length,
    data: columns
  })
}

//! Add new column
export const add = async (req: Request, res: Response, next: NextFunction) => {
  const { _id: owner } = req.user
  const { boardName: board } = req.params

  const isCurrentBoard = await Board.findOne({ title: board, owner })
  if (!isCurrentBoard) {
    return next(createHttpError(404, `Board ${board} not found`))
  }

  const newColumn = await Column.create({ ...req.body, board, owner })

  await Board.findOneAndUpdate(
    { title: board, owner },
    { $push: { columns: newColumn } }
  )

  const extendedColumn = await newColumn.populate('owner', [
    'name',
    'email',
    'userTheme'
  ])

  res.status(201).json(extendedColumn)
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

  await Board.findOneAndUpdate(
    { title: board, owner, 'columns._id': _id },
    {
      $set: {
        'columns.$.title': updatedColumn.title,
        'columns.$.createdAt': updatedColumn.createdAt,
        'columns.$.updatedAt': updatedColumn.updatedAt
      }
    }
  )

  const extendedColumn = await updatedColumn.populate('owner', [
    'name',
    'email',
    'userTheme'
  ])

  res.json(extendedColumn)
}

//!Delete column
export const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: board, columnId: _id } = req.params

  const deletedColumn = await Column.findOneAndDelete({ _id, board, owner })

  if (!deletedColumn) {
    return next(createHttpError(404, 'Column not found'))
  }

  await Board.findOneAndUpdate(
    { title: board, owner },
    {
      $pull: { columns: { _id, board, owner } }
    }
  )

  res.json({
    message: 'Column deleted'
  })
}
