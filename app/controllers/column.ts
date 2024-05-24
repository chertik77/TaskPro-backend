import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Board } from 'models/Board'
import { Column } from 'models/Column'

class Controller {
  add = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user
    const { boardId: board } = req.params

    const isCurrentBoard = await Board.findOne({ _id: board, owner })

    if (!isCurrentBoard) {
      return next(createHttpError(404, `Board not found`))
    }

    const newColumn = await Column.create({ ...req.body, board, owner })

    await Board.updateOne(
      { _id: board, owner },
      { $push: { columns: newColumn } }
    )

    res.status(201).json(newColumn)
  }

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user
    const { columnId: _id } = req.params

    const updatedColumn = await Column.findOneAndUpdate(
      { _id, owner },
      req.body,
      { fields: '-cards' }
    )

    if (!updatedColumn) {
      return next(createHttpError(404, 'Column not found'))
    }

    await Board.updateOne(
      { owner, 'columns._id': _id },
      {
        $set: {
          'columns.$.title': updatedColumn.title
        }
      }
    )

    res.json(updatedColumn)
  }

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user
    const { boardId: board, columnId: _id } = req.params

    const deletedColumn = await Column.findOneAndDelete({
      _id,
      board,
      owner
    }).select('-cards')

    if (!deletedColumn) {
      return next(createHttpError(404, 'Column not found'))
    }

    await Board.updateOne(
      { _id: board, owner },
      {
        $pull: { columns: { _id, board, owner } }
      }
    )

    res.json(deletedColumn)
  }
}

export const columnController = new Controller()
