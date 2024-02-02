import type { NextFunction, Request, Response } from 'express'
import { Board } from '@/models/Board'
import createHttpError from 'http-errors'

export const getAll = async (req: Request, res: Response) => {
  const { _id: owner } = req.user

  const boards = await Board.find({ owner }).populate('owner', [
    'name',
    'email',
    'avatarURL',
    'userTheme'
  ])

  res.json(boards)
}

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: title } = req.params

  const board = await Board.findOne({ title, owner }).populate('owner', [
    'name',
    'email',
    'avatarURL',
    'userTheme'
  ])

  if (!board) {
    return next(createHttpError(404, `Board ${title} not found`))
  }

  res.json(board)
}

export const add = async (req: Request, res: Response, next: NextFunction) => {
  const { _id: owner } = req.user
  const { title } = req.body

  const board = await Board.findOne({ title, owner })
  if (board) {
    return next(createHttpError(409, 'Board with the same name already exists'))
  }

  const newBoard = await Board.create({ ...req.body, owner })
  const expandedBoard = await newBoard.populate('owner', [
    'name',
    'email',
    'avatarURL',
    'userTheme'
  ])

  res.status(201).json(expandedBoard)
}

export const updateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: title } = req.params
  const { title: newTitle } = req.body

  if (newTitle && newTitle !== title) {
    const board = await Board.findOne({ title: newTitle, owner })
    if (board) {
      return next(
        createHttpError(409, 'Board with the same name already exists')
      )
    }
  }

  const updatedBoard = await Board.findOneAndUpdate(
    { title, owner },
    req.body
  ).populate('owner', ['name', 'email', 'avatarURL', 'userTheme'])

  if (!updatedBoard) {
    return next(createHttpError(404, `Board ${title} not found`))
  }

  res.json(updatedBoard)
}

export const removeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: title } = req.params

  const removedBoard = await Board.findOneAndRemove({ title, owner })

  if (!removedBoard) {
    return next(createHttpError(404, `Board ${title} not found`))
  }

  res.json({
    message: `Board ${title} deleted`
  })
}
