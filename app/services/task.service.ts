import type {
  CreateTaskSchema,
  MoveTaskSchema,
  UpdateTaskSchema,
  UpdateTasksOrderSchema
} from '@/schemas'
import type { z } from 'zod'

import { prisma } from '@/prisma'
import { invalidate } from '@/redis'
import { HTTPException } from 'hono/http-exception'

import { getOrderBetween, getRebalancedOrder, ORDER_STEP } from '@/utils'

class TaskService {
  create = async (
    data: z.infer<typeof CreateTaskSchema>,
    columnId: string,
    userId: string
  ) => {
    const column = await prisma.column.findUnique({
      where: { id: columnId, board: { userId } }
    })

    if (!column) throw new HTTPException(404, { message: 'Column not found' })

    await this.assertLabelsOwned(data.labels, userId)

    const newOrder = await this.getAppendOrder(column.id)

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
    let order: number | undefined

    if (data.columnId) {
      const [column, task] = await Promise.all([
        prisma.column.findUnique({
          where: { id: data.columnId, board: { userId } },
          select: { id: true }
        }),
        prisma.task.findFirst({
          where: { id: taskId, column: { board: { userId } } },
          select: { columnId: true }
        })
      ])

      if (!column) throw new HTTPException(404, { message: 'Column not found' })

      if (task && task.columnId !== column.id) {
        order = await this.getAppendOrder(column.id)
      }
    }

    await this.assertLabelsOwned(data.labels, userId)

    const updatedTask = await prisma.task.updateIgnoreNotFound({
      where: { id: taskId, column: { board: { userId } } },
      data: {
        ...data,
        ...(order !== undefined && { order }),
        ...(data.completed !== undefined && {
          completedAt: data.completed ? new Date() : null
        }),
        labels: { set: data.labels?.map(id => ({ id })) }
      },
      include: {
        labels: true,
        column: { select: { boardId: true } }
      }
    })

    if (!updatedTask) {
      throw new HTTPException(404, { message: 'Task not found' })
    }

    const { column, ...task } = updatedTask

    await invalidate.board(userId, column.boardId)

    return task
  }

  move = async (
    data: z.infer<typeof MoveTaskSchema>,
    taskId: string,
    userId: string
  ) => {
    const [task, column] = await Promise.all([
      prisma.task.findFirst({
        where: { id: taskId, column: { board: { userId } } },
        select: { id: true }
      }),
      prisma.column.findUnique({
        where: { id: data.columnId, board: { userId } },
        select: { id: true, boardId: true }
      })
    ])

    if (!task) throw new HTTPException(404, { message: 'Task not found' })

    if (!column) throw new HTTPException(404, { message: 'Column not found' })

    const order = await this.resolveMoveOrder(data, task.id, column.id)

    const movedTask = await prisma.task.update({
      where: { id: task.id },
      data: { order, columnId: column.id },
      include: { labels: true }
    })

    await invalidate.board(userId, column.boardId)

    return movedTask
  }

  updateOrder = async (
    data: z.infer<typeof UpdateTasksOrderSchema>,
    columnId: string,
    userId: string
  ) => {
    const column = await prisma.column.findUnique({
      where: { id: columnId, board: { userId } },
      select: { id: true, boardId: true }
    })

    if (!column) {
      throw new HTTPException(404, { message: 'Column not found' })
    }

    const uniqueIds = [...new Set(data.ids)]

    const ownedCount = await prisma.task.count({
      where: { id: { in: uniqueIds }, column: { board: { userId } } }
    })

    if (ownedCount !== uniqueIds.length) {
      throw new HTTPException(404, { message: 'Task not found' })
    }

    const transaction = uniqueIds.map((id, index) =>
      prisma.task.update({
        where: { id, column: { board: { userId } } },
        data: { order: getRebalancedOrder(index), columnId: column.id }
      })
    )

    try {
      await prisma.$transaction(transaction)
    } catch {
      throw new HTTPException(400, { message: 'Invalid order' })
    }

    await invalidate.board(userId, column.boardId)
  }

  deleteById = async (taskId: string, userId: string) => {
    const deletedTask = await prisma.task.deleteIgnoreNotFound({
      where: { id: taskId, column: { board: { userId } } },
      include: { column: { select: { boardId: true } } }
    })

    if (!deletedTask) {
      throw new HTTPException(404, { message: 'Task not found' })
    }

    await invalidate.board(userId, deletedTask.column.boardId)
  }

  private assertLabelsOwned = async (
    labelIds: string[] | undefined,
    userId: string
  ) => {
    if (!labelIds?.length) return

    const uniqueIds = [...new Set(labelIds)]

    const ownedCount = await prisma.label.count({
      where: { id: { in: uniqueIds }, userId }
    })

    if (ownedCount !== uniqueIds.length) {
      throw new HTTPException(404, { message: 'Label not found' })
    }
  }

  private getAppendOrder = async (columnId: string) => {
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    return lastTask ? lastTask.order + ORDER_STEP : 0
  }

  private resolveMoveOrder = async (
    { prevTaskId, nextTaskId }: z.infer<typeof MoveTaskSchema>,
    taskId: string,
    columnId: string,
    rebalanced = false
  ): Promise<number> => {
    const neighbourIds = [prevTaskId, nextTaskId].filter(
      (id): id is string => !!id && id !== taskId
    )

    if (!neighbourIds.length) return this.getAppendOrder(columnId)

    const neighbours = await prisma.task.findMany({
      where: { id: { in: neighbourIds }, columnId },
      select: { id: true, order: true }
    })

    const prev = neighbours.find(n => n.id === prevTaskId)
    const next = neighbours.find(n => n.id === nextTaskId)

    if (!prev && !next) return this.getAppendOrder(columnId)

    const order = getOrderBetween({ prev, next })

    if (order !== null) return order

    if (rebalanced) return this.getAppendOrder(columnId)

    await this.rebalance(columnId)

    return this.resolveMoveOrder(
      { columnId, prevTaskId, nextTaskId },
      taskId,
      columnId,
      true
    )
  }

  private rebalance = async (columnId: string) => {
    const tasks = await prisma.task.findMany({
      where: { columnId },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      select: { id: true }
    })

    await prisma.$transaction(
      tasks.map((task, index) =>
        prisma.task.update({
          where: { id: task.id },
          data: { order: getRebalancedOrder(index) }
        })
      )
    )
  }
}

export const taskService = new TaskService()
