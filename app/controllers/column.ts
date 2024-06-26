import type { NextFunction, Request, Response } from 'express'

import createHttpError from 'http-errors'

import { Board, Column } from 'models'

export const columnController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user

    const board = await Board.findOne({ _id: req.params.boardId, owner })

    if (!board) {
      return next(createHttpError(404, `Board not found`))
    }

    const { id, title } = await Column.create({ ...req.body, board, owner })

    res.status(201).json({ id, title })
  },

  updateById: async (req: Request, res: Response, next: NextFunction) => {
    const updatedColumn = await Column.findOneAndUpdate(
      { _id: req.params.columnId, owner: req.user.id },
      req.body
    )

    if (!updatedColumn) {
      return next(createHttpError(404, 'Column not found'))
    }

    res.json(updatedColumn)
  },

  deleteById: async (req: Request, res: Response, next: NextFunction) => {
    const deletedColumn = await Column.findOneAndDelete({
      _id: req.params.columnId,
      owner: req.user.id
    })

    if (!deletedColumn) {
      return next(createHttpError(404, `Column Not Found`))
    }

    res.status(204).json()
  }
}
