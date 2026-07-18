import type {
  BoardParamsSchema,
  CreateBoardSchema,
  UpdateBoardSchema
} from '@/schemas'
import type {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams
} from '@/types'
import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'

import { prisma } from '@/prisma'
import { NotFound } from 'http-errors'

import { redisClient } from '@/config'
import boardImages from '@/data/board-bg-images.json'

class BoardController {
  getAll = async ({ user }: Request, res: Response) => {
    const cacheKey = `boards:user:${user.id}:all`

    const cachedBoards = await redisClient.get(cacheKey)

    if (cachedBoards) {
      res.json(JSON.parse(cachedBoards))
    } else {
      const boards = await prisma.board.findMany({ where: { userId: user.id } })

      await redisClient.set(cacheKey, JSON.stringify(boards), 'EX', 5 * 60)

      res.json(boards)
    }
  }

  getById = async (
    { user, params }: TypedRequestParams<typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const cacheKey = `board:${params.boardId}:user:${user.id}`

    const cachedBoard = await redisClient.get(cacheKey)

    if (cachedBoard) {
      res.json(JSON.parse(cachedBoard))
    } else {
      // const taskSettings = await prisma.taskSettings.findUnique({
      //   where: { userId: user.id },
      //   select: { sortTasksBy: true }
      // })

      // const orderBy = this.getTaskOrderBy(taskSettings?.sortTasksBy)

      const board = await prisma.board.findUnique({
        where: { id: params.boardId, userId: user.id },
        include: {
          columns: {
            orderBy: { order: 'asc' },
            include: {
              tasks: { include: { labels: true }, orderBy: { order: 'asc' } }
            }
          }
        }
      })

      if (!board) return next(NotFound('Board not found'))

      await redisClient.set(cacheKey, JSON.stringify(board), 'EX', 5 * 60)

      res.json(board)
    }
  }

  create = async (
    { body, user }: TypedRequestBody<typeof CreateBoardSchema>,
    res: Response
  ) => {
    const newBoard = await prisma.board.create({
      data: {
        ...body,
        userId: user.id,
        background: {
          identifier: body.background,
          url: boardImages[body.background]
        }
      }
    })

    await redisClient.del(`boards:user:${user.id}:all`)

    res.json(newBoard)
  }

  updateById = async (
    {
      body,
      params,
      user
    }: TypedRequest<
      typeof BoardParamsSchema,
      ZodType,
      typeof UpdateBoardSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    const updatedBoard = await prisma.board.updateIgnoreNotFound({
      where: { id: params.boardId, userId: user.id },
      data: {
        ...body,
        background: body.background
          ? {
              identifier: body.background,
              url: boardImages[body.background]
            }
          : undefined
      }
    })

    if (!updatedBoard) return next(NotFound('Board not found'))

    await redisClient.del(`board:${updatedBoard.id}:user:${user.id}`)
    await redisClient.del(`boards:user:${user.id}:all`)

    res.json(updatedBoard)
  }

  deleteById = async (
    { params, user }: TypedRequestParams<typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const deletedBoard = await prisma.board.deleteIgnoreNotFound({
      where: { id: params.boardId, userId: user.id }
    })

    if (!deletedBoard) return next(NotFound('Board not found'))

    await redisClient.del(`board:${deletedBoard.id}:user:${user.id}`)
    await redisClient.del(`boards:user:${user.id}:all`)

    res.sendStatus(204)
  }

  // getTaskOrderBy = (
  //   sort: TaskSort = TaskSort.manual
  // ): Prisma.TaskOrderByWithRelationInput[] => {
  //   switch (sort) {
  //     case TaskSort.manual:
  //       return [{ order: 'asc' }]

  //     case TaskSort.priority:
  //       return [{ priority: 'desc' }]

  //     case TaskSort.deadline:
  //       return [{ deadline: 'asc' }, { order: 'asc' }]

  //     case TaskSort.created:
  //       return [{ createdAt: 'desc' }]

  //     case TaskSort.alphabetical:
  //       return [{ title: 'asc' }]
  //   }
  // }
}

export const boardController = new BoardController()
