import type {
  AddBoardSchema,
  BoardParamsSchema,
  EditBoardSchema
} from '@/schemas'
import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import type {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams
} from 'zod-express-middleware'

import { NotFound } from 'http-errors'

import { boardService } from '@/services'

import { redis } from '@/config'

import { assertHasUser } from '@/utils'

export const boardController = {
  getAll: async (req: Request, res: Response) => {
    assertHasUser(req)

    const cacheKey = `boards: ${req.user.id}`

    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      res.json(JSON.parse(cachedData))
    } else {
      const boards = await boardService.getAll(req.user.id)

      await redis.set(cacheKey, JSON.stringify(boards))

      res.json(boards)
    }
  },

  getById: async (
    req: TypedRequestParams<typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    assertHasUser(req)

    const cacheKey = `board: ${req.params.boardId}`

    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      res.json(JSON.parse(cachedData))
    } else {
      const board = await boardService.getById(req.params.boardId, req.user.id)

      if (!board) return next(NotFound('Board not found'))

      await redis.set(cacheKey, JSON.stringify(board))

      res.json(board)
    }
  },

  add: async (req: TypedRequestBody<typeof AddBoardSchema>, res: Response) => {
    assertHasUser(req)

    const newBoard = await boardService.create(req.body, req.user.id)

    res.json(newBoard)
  },

  updateById: async (
    req: TypedRequest<
      typeof BoardParamsSchema,
      ZodType,
      typeof EditBoardSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    assertHasUser(req)

    const updatedBoard = await boardService.updateById(
      req.params.boardId,
      req.body,
      req.user.id
    )

    if (!updatedBoard) return next(NotFound('Board not found'))

    res.json(updatedBoard)
  },

  deleteById: async (
    req: TypedRequestBody<typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    assertHasUser(req)

    const deletedBoard = await boardService.deleteById(
      req.params.boardId,
      req.user.id
    )

    if (!deletedBoard) return next(NotFound('Board not found'))

    res.status(200).send()
  }
}
