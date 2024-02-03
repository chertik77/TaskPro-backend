import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Column } from 'models/Column'
import { Board } from 'models/Board'

export const getAll = async (req: Request, res: Response) => {
  const { _id: owner } = req.user
  const { boardName: board } = req.params

  const columns = await Column.find({ board, owner }).populate('owner', [
    'name',
    'email',
    'avatarURL',
    'userTheme'
  ])

  res.json({
    total: columns.length,
    columns
  })
}

// export const getById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { _id: owner } = req.user
//   const { boardName: board, columnId: _id } = req.params

//   const column = await Column.findOne({ _id, board, owner }).populate('owner', [
//     'name',
//     'email',
//     'avatarURL',
//     'userTheme'
//   ])

//   if (!column) {
//     return next(createHttpError(404, 'Column not found'))
//   }

//   res.json(board)
// }

export const add = async (req: Request, res: Response, next: NextFunction) => {
  const { _id: owner } = req.user
  const { boardName: board } = req.params

  const isCurrentBoard = await Board.findOne({ title: board, owner })
  if (!isCurrentBoard) {
    return next(createHttpError(404, `Board ${board} not found`))
  }

  const newColumn = await Column.create({ ...req.body, board, owner })
  const expandedColumn = await newColumn.populate('owner', [
    'name',
    'email',
    'avatarURL',
    'userTheme'
  ])

  res.status(201).json(expandedColumn)
}

export const updateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: board, columnId: _id } = req.params

  const updatedColumn = await Column.findOneAndUpdate(
    { _id, board, owner },
    req.body
  ).populate('owner', ['name', 'email', 'avatarURL', 'userTheme'])

  if (!updatedColumn) {
    return next(createHttpError(404, 'Column not found'))
  }

  res.json(updatedColumn)
}

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

  res.json({
    message: 'Column deleted'
  })
}
