import type {
  AddColumnSchema,
  BoardParamsSchema,
  ColumnParamsSchema,
  EditColumnSchema,
  UpdateColumnOrderSchema
} from '@/schemas'
import type { NextFunction, Response } from 'express'
import type { ZodType } from 'zod'
import type { TypedRequest, TypedRequestParams } from 'zod-express-middleware'

import { NotFound } from 'http-errors'

import { columnService } from '@/services'

import { assertHasUser } from '@/utils'

export const columnController = {
  add: async (
    req: TypedRequest<
      typeof BoardParamsSchema,
      ZodType,
      typeof AddColumnSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    assertHasUser(req)

    try {
      const column = await columnService.create(
        req.params.boardId,
        req.body,
        req.user.id
      )
      res.json(column)
    } catch (error) {
      next(error)
    }
  },

  updateById: async (
    {
      params,
      body
    }: TypedRequest<
      typeof ColumnParamsSchema,
      ZodType,
      typeof EditColumnSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    const updatedColumn = await columnService.updateById(params.columnId, body)

    if (!updatedColumn) return next(NotFound('Column not found'))

    res.json(updatedColumn)
  },

  updateOrder: async (
    {
      params,
      body
    }: TypedRequest<
      typeof BoardParamsSchema,
      ZodType,
      typeof UpdateColumnOrderSchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const updatedColumns = await columnService.updateOrder(
        params.boardId,
        body
      )
      res.json(updatedColumns)
    } catch (error) {
      next(error)
    }
  },

  deleteById: async (
    { params }: TypedRequestParams<typeof ColumnParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const deletedColumn = await columnService.deleteById(params.columnId)

    if (!deletedColumn) return next(NotFound('Column not found'))

    res.status(204).send()
  }
}
