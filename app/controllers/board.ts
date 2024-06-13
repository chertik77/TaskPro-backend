import { Board } from '@/models/Board'
import { Column } from '@/models/Column'
import { getBgImage } from '@/utils/bg-image'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Types } from 'mongoose'

class Controller {
  getAll = async (req: Request, res: Response) => {
    const boards = await Board.find({ owner: req.user.id }).select('-columns')

    res.json(boards)
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user
    const { boardId } = req.params

    const board = await Board.findOne({ _id: boardId, owner })

    if (!board) {
      return next(createHttpError(404, `Board not found`))
    }

    const result = await Column.aggregate([
      {
        $match: {
          board: new Types.ObjectId(boardId),
          owner: new Types.ObjectId(owner)
        }
      },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'column',
          as: 'cards'
        }
      },
      { $addFields: { id: '$_id' } },
      { $project: { _id: 0, owner: 0, board: 0 } },
      {
        $addFields: {
          cards: {
            $map: {
              input: '$cards',
              as: 'card',
              in: {
                id: '$$card._id',
                title: '$$card.title',
                description: '$$card.description',
                priority: '$$card.priority',
                deadline: '$$card.deadline',
                column: '$$card.column'
              }
            }
          }
        }
      }
    ])

    res.json({ ...board.toJSON(), columns: result })
  }

  add = async (req: Request, res: Response) => {
    const { id: owner } = req.user

    const newBoard = await Board.create({
      ...req.body,
      owner,
      background: getBgImage(req.body.background)
    })

    res.status(201).json(newBoard)
  }

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user
    const { boardId: _id } = req.params

    const updatedBoard = await Board.findOneAndUpdate(
      { _id, owner },
      { ...req.body, background: getBgImage(req.body.background) }
    )

    if (!updatedBoard) {
      return next(createHttpError(404, `Board not found`))
    }

    res.json(updatedBoard)
  }

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    const { id: owner } = req.user
    const { boardId: _id } = req.params

    const deletedBoard = await Board.findOneAndDelete({ _id, owner })

    if (!deletedBoard) {
      return next(createHttpError(404, `Board not found`))
    }

    res.status(204).json({})
  }
}

export const boardController = new Controller()
