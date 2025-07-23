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

import { boardService } from '@/services'
import { NotFound } from 'http-errors'

import { assertHasUser } from '@/utils'

export const boardController = {
  getAll: async (req: Request, res: Response) => {
    assertHasUser(req)

    const boards = await boardService.getAll(req.user.id)

    res.json(boards)
  },

  getById: async (
    req: TypedRequestParams<typeof BoardParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    assertHasUser(req)

    const board = await boardService.getById(req.params.boardId, req.user.id)

    if (!board) return next(NotFound('Board not found'))

    res.json(board)
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
