import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Task } from 'models/Task'
import { Column } from 'models/Column'

export const getAll = async (req: Request, res: Response) => {
  const { _id: owner } = req.user
  const { boardName: board } = req.params
  const { task_priority: priority = false } = req.query

  let tasks

  if (!priority) {
    tasks = await Task.find({ board, owner })
      .populate('owner', ['name', 'email', 'avatarURL', 'userTheme'])
      .populate('column', 'title')
  } else {
    tasks = await Task.find({ board, owner, priority })
      .populate('owner', ['name', 'email', 'avatarURL', 'userTheme'])
      .populate('column', 'title')
  }

  res.json({
    total: tasks.length,
    tasks
  })
}

export const add = async (req: Request, res: Response, next: NextFunction) => {
  const { _id: owner } = req.user
  const { boardName: board, columnId: column } = req.params

  const isCurrentColumn = await Column.findOne({ _id: column, board, owner })
  if (!isCurrentColumn) {
    return next(createHttpError(404, 'Column not found'))
  }

  const newTask = await Task.create({ ...req.body, column, board, owner })
  const tempTask = await newTask.populate('column', 'title')
  const expandedTask = await tempTask.populate('owner', [
    'name',
    'email',
    'avatarURL',
    'userTheme'
  ])

  res.status(201).json(expandedTask)
}

export const updateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: board, columnId: column, taskId: _id } = req.params

  const updatedTask = await Task.findOneAndUpdate(
    { _id, column, board, owner },
    req.body
  )
    .populate('owner', ['name', 'email', 'avatarURL', 'userTheme'])
    .populate('column', 'title')

  if (!updatedTask) {
    return next(createHttpError(404, 'Task not found'))
  }

  res.json(updatedTask)
}

export const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: board, columnId: column, taskId: _id } = req.params

  const deletedTask = await Task.findOneAndDelete({
    _id,
    column,
    board,
    owner
  })

  if (!deletedTask) {
    return next(createHttpError(404, 'Task not found'))
  }

  res.json({
    message: 'Task deleted'
  })
}

export const changeTaskColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const {
    boardName: board,
    columnId: column,
    taskId: _id,
    newColumnId
  } = req.params

  const task = await Task.findOneAndUpdate(
    { _id, column, board, owner },
    { column: newColumnId }
  )
    .populate('owner', ['name', 'email', 'avatarURL', 'userTheme'])
    .populate('column', 'title')

  if (!task) {
    return next(createHttpError(404, 'Task not found'))
  }

  res.json(task)
}
