import type {
  ColumnParamsSchema,
  CreateTaskSchema,
  TaskParamsSchema,
  UpdateTaskOrderSchema,
  UpdateTaskSchema
} from '@/schemas'
import type { TypedRequest, TypedRequestParams } from '@/types'
import type { NextFunction, Response } from 'express'
import type { ZodType } from 'zod'

import { prisma } from '@/prisma'
import { invalidate } from '@/redis'
import { BadRequest, NotFound } from 'http-errors'

class TaskController {
  create = async (
    {
      user,
      params,
      body
    }: TypedRequest<
      typeof ColumnParamsSchema,
      ZodType,
      typeof CreateTaskSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    const column = await prisma.column.findUnique({
      where: { id: params.columnId },
      include: { board: { select: { userId: true } } }
    })

    if (!column) return next(NotFound('Column not found'))

    const newOrder = await this.getNewTaskOrder(column.id)

    const newTask = await prisma.task.create({
      data: {
        ...body,
        columnId: column.id,
        order: newOrder,
        labels: { connect: body.labels?.map(id => ({ id })) }
      },
      include: { labels: true }
    })

    await invalidate.board(user.id, column.boardId)

    res.json(newTask)
  }

  updateById = async (
    {
      user,
      params,
      body
    }: TypedRequest<typeof TaskParamsSchema, ZodType, typeof UpdateTaskSchema>,
    res: Response,
    next: NextFunction
  ) => {
    if (body.columnId) {
      const column = await prisma.column.findUnique({
        where: { id: body.columnId }
      })

      if (!column) return next(NotFound('Column not found'))
    }

    const updatedTask = await prisma.task.updateIgnoreNotFound({
      where: { id: params.taskId },
      data: {
        ...body,
        completedAt: body.completed ? new Date() : null,
        labels: { set: body.labels?.map(id => ({ id })) }
      },
      include: {
        labels: true,
        column: { include: { board: { select: { userId: true } } } }
      }
    })

    if (!updatedTask) return next(NotFound('Task not found'))

    const { column, ...task } = updatedTask

    await invalidate.board(user.id, column.boardId)

    res.json(task)
  }

  updateOrder = async (
    {
      user,
      params,
      body
    }: TypedRequest<
      typeof ColumnParamsSchema,
      ZodType,
      typeof UpdateTaskOrderSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    const column = await prisma.column.findUnique({
      where: { id: params.columnId },
      include: { board: { select: { userId: true } } }
    })

    if (!column) return next(NotFound('Column not found'))

    const transaction = body.ids.map((id, order) =>
      prisma.task.update({
        where: { id },
        data: { order, columnId: column.id }
      })
    )

    try {
      const updatedTasks = await prisma.$transaction(transaction)

      await invalidate.board(user.id, column.boardId)

      res.json(updatedTasks)
    } catch {
      return next(BadRequest('Invalid order'))
    }
  }

  deleteById = async (
    { user, params }: TypedRequestParams<typeof TaskParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const deletedTask = await prisma.task.deleteIgnoreNotFound({
      where: { id: params.taskId },
      include: { column: { include: { board: { select: { userId: true } } } } }
    })

    if (!deletedTask) return next(NotFound('Task not found'))

    await invalidate.board(user.id, deletedTask.column.boardId)

    res.sendStatus(204)
  }

  private getNewTaskOrder = async (columnId: string) => {
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = lastTask ? lastTask.order + 1 : 1

    return newOrder
  }
}

export const taskController = new TaskController()
