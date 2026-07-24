import type {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdateTasksOrderSchema
} from '@/schemas'
import type { z } from 'zod'

import { prisma } from '@/prisma'
import { invalidate } from '@/redis'
import { HTTPException } from 'hono/http-exception'

class TaskService {
  create = async (
    data: z.infer<typeof CreateTaskSchema>,
    columnId: string,
    userId: string
  ) => {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { board: { select: { userId: true } } }
    })

    if (!column) throw new HTTPException(404, { message: 'Column not found' })

    const newOrder = await this.getNewTaskOrder(column.id)

    const newTask = await prisma.task.create({
      data: {
        ...data,
        columnId: column.id,
        order: newOrder,
        labels: { connect: data.labels?.map(id => ({ id })) }
      },
      include: { labels: true }
    })

    await invalidate.board(userId, column.boardId)

    return newTask
  }

  updateById = async (
    data: z.infer<typeof UpdateTaskSchema>,
    taskId: string,
    userId: string
  ) => {
    if (data.columnId) {
      const column = await prisma.column.findUnique({
        where: { id: data.columnId }
      })

      if (!column) throw new HTTPException(404, { message: 'Column not found' })
    }

    const updatedTask = await prisma.task.updateIgnoreNotFound({
      where: { id: taskId },
      data: {
        ...data,
        completedAt: data.completed ? new Date() : null,
        labels: { set: data.labels?.map(id => ({ id })) }
      },
      include: {
        labels: true,
        column: { include: { board: { select: { userId: true } } } }
      }
    })

    if (!updatedTask) {
      throw new HTTPException(404, { message: 'Task not found' })
    }

    const { column, ...task } = updatedTask

    await invalidate.board(userId, column.boardId)

    return task
  }

  updateOrder = async (
    data: z.infer<typeof UpdateTasksOrderSchema>,
    columnId: string,
    userId: string
  ) => {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { board: { select: { userId: true } } }
    })

    if (!column) {
      throw new HTTPException(404, { message: 'Column not found' })
    }

    const transaction = data.ids.map((id, order) =>
      prisma.task.update({
        where: { id },
        data: { order, columnId: column.id }
      })
    )

    try {
      const updatedTasks = await prisma.$transaction(transaction)

      await invalidate.board(userId, column.boardId)

      return updatedTasks
    } catch {
      throw new HTTPException(400, { message: 'Invalid order' })
    }
  }

  deleteById = async (taskId: string, userId: string) => {
    const deletedTask = await prisma.task.deleteIgnoreNotFound({
      where: { id: taskId },
      include: { column: { include: { board: { select: { userId: true } } } } }
    })

    if (!deletedTask) {
      throw new HTTPException(404, { message: 'Task not found' })
    }

    await invalidate.board(userId, deletedTask.column.boardId)
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

export const taskService = new TaskService()
