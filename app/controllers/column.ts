import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Board } from 'models/Board'
import { Column } from 'models/Column'

export const columnController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user

    const board = await Board.findOne({ _id: req.params.boardId, owner })

    if (!board) {
      return next(createHttpError(404, `Board not found`))
    }

    const newColumn = await Column.create({ ...req.body, board, owner })

    res.status(201).json(newColumn)
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
    const { id: owner } = req.user
    const { columnId: _id } = req.params

    const column = await Column.findById(_id)

    if (!column) {
      return next(createHttpError(404, `Column Not Found`))
    }

    await Column.findOneAndDelete({ _id, owner })

    res.status(204).json()
  }
}
