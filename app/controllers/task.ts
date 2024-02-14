import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Task } from 'models/Task'
import { Column } from 'models/Column'
import { Board } from 'models/Board'

//! Add new task
export const add = async (req: Request, res: Response, next: NextFunction) => {
  const { _id: owner } = req.user
  const { boardId: board, columnId: column } = req.params

  const isCurrentColumn = await Column.findOne({ _id: column, board, owner })
  if (!isCurrentColumn) {
    return next(createHttpError(404, 'Column not found'))
  }

  const newTask = await Task.create({ ...req.body, column, board, owner })

  const columnWithTasks = await Column.findOneAndUpdate(
    { _id: column, board, owner },
    { $push: { tasks: newTask } }
  )
  await Board.updateOne(
    { _id: board, owner, 'columns._id': columnWithTasks?._id },
    {
      $set: {
        'columns.$.tasks': columnWithTasks?.tasks
      }
    }
  )

  res.status(201).json(newTask)
}

//! Edit task
export const updateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardId: board, columnId: column, taskId: _id } = req.params

  const updatedTask = await Task.findOneAndUpdate(
    { _id, column, board, owner },
    req.body
  )

  if (!updatedTask) {
    return next(createHttpError(404, 'Task not found'))
  }

  const columnWithTasks = await Column.findOneAndUpdate(
    { _id: column, board, owner, 'tasks._id': _id },
    {
      $set: {
        'tasks.$.title': updatedTask.title,
        'tasks.$.description': updatedTask.description,
        'tasks.$.priority': updatedTask.priority,
        'tasks.$.deadline': updatedTask.deadline
      }
    }
  )
  await Board.updateOne(
    { _id: board, owner, 'columns._id': columnWithTasks?._id },
    {
      $set: {
        'columns.$.tasks': columnWithTasks?.tasks
      }
    }
  )

  res.json(updatedTask)
}

//! Delete task
export const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardId: board, columnId: column, taskId: _id } = req.params

  const deletedTask = await Task.findOneAndDelete({
    _id,
    column,
    board,
    owner
  })

  if (!deletedTask) {
    return next(createHttpError(404, 'Task not found'))
  }

  const columnWithTasks = await Column.findOneAndUpdate(
    { _id: column, board, owner },
    { $pull: { tasks: { _id, column, board, owner } } }
  )
  await Board.updateOne(
    { _id: board, owner, 'columns._id': columnWithTasks?._id },
    {
      $set: {
        'columns.$.tasks': columnWithTasks?.tasks
      }
    }
  )

  res.json(deletedTask)
}

//! Change column for task
export const changeTaskColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const {
    boardId: board,
    columnId: column,
    taskId: _id,
    newColumnId
  } = req.params

  const task = await Task.findOneAndUpdate(
    { _id, column, board, owner },
    { column: newColumnId }
  )

  if (!task) {
    return next(createHttpError(404, 'Task not found'))
  }

  const delTaskByOldColId = await Column.findOneAndUpdate(
    { _id: column, board, owner },
    { $pull: { tasks: { _id, column, board, owner } } }
  )
  await Board.updateOne(
    { _id: board, owner, 'columns._id': delTaskByOldColId?._id },
    {
      $set: {
        'columns.$.tasks': delTaskByOldColId?.tasks
      }
    }
  )

  const addTaskByNewColId = await Column.findOneAndUpdate(
    { _id: newColumnId, board, owner },
    { $push: { tasks: task } }
  )
  await Board.updateOne(
    { _id: board, owner, 'columns._id': addTaskByNewColId?._id },
    {
      $set: {
        'columns.$.tasks': addTaskByNewColId?.tasks
      }
    }
  )

  res.json(task)
}
