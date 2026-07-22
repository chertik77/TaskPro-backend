import { createProtectedRouter } from '@/lib'
import { columnService } from '@/services'

import { zValidator } from '@/middlewares'

import {
  BoardParamsSchema,
  ColumnParamsSchema,
  CreateColumnSchema,
  UpdateColumnOrderSchema,
  UpdateColumnSchema
} from '@/schemas'

export const columnRouter = createProtectedRouter()

columnRouter.post(
  '/:boardId',
  zValidator('param', BoardParamsSchema),
  zValidator('json', CreateColumnSchema),
  async c => {
    const { boardId } = c.req.valid('param')
    const json = c.req.valid('json')
    const user = c.get('user')

    const column = await columnService.create(json, boardId, user.id)

    return c.json(column)
  }
)

columnRouter.patch(
  '/:columnId',
  zValidator('param', ColumnParamsSchema),
  zValidator('json', UpdateColumnSchema),
  async c => {
    const { columnId } = c.req.valid('param')
    const json = c.req.valid('json')
    const user = c.get('user')

    const column = await columnService.updateById(json, columnId, user.id)

    return c.json(column)
  }
)

columnRouter.patch(
  '/:boardId/order',
  zValidator('param', BoardParamsSchema),
  zValidator('json', UpdateColumnOrderSchema),
  async c => {
    const { boardId } = c.req.valid('param')
    const json = c.req.valid('json')
    const user = c.get('user')

    const columns = await columnService.updateOrder(json, boardId, user.id)

    return c.json(columns)
  }
)

columnRouter.delete(
  '/:columnId',
  zValidator('param', ColumnParamsSchema),
  async c => {
    const { columnId } = c.req.valid('param')
    const user = c.get('user')

    await columnService.deleteById(columnId, user.id)

    return c.status(204)
  }
)
