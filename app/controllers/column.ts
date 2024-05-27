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

    res.status(201).json(newColumn)
  }

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user

    const { columnId: _id } = req.params

    const updatedColumn = await Column.findOneAndUpdate(
      { _id, owner },
      req.body
    )

    if (!updatedColumn) {
      return next(createHttpError(404, 'Column not found'))
    }

    res.json(updatedColumn)
  }

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user
    const { columnId: _id } = req.params

    const column = await Column.findById(_id)

    if (!column) {
      throw next(createHttpError(404, `Column Not Found`))
    }

    const deletedColumn = await Column.findOneAndDelete({ _id, owner })

    res.json(deletedColumn)
  }
}

export const columnController = new Controller()
