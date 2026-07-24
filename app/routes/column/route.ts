import { createProtectedRouter } from '@/lib'
import { columnService } from '@/services'

import {
  createColumnRoute,
  deleteColumnRoute,
  updateColumnRoute,
  updateColumnsOrderRoute
} from './openapi'

export const columnRouter = createProtectedRouter()

columnRouter.openapi(createColumnRoute, async c => {
  const { boardId } = c.req.valid('param')
  const json = c.req.valid('json')
  const user = c.get('user')

  const column = await columnService.create(json, boardId, user.id)

  return c.json(column, 201)
})

columnRouter.openapi(updateColumnRoute, async c => {
  const { columnId } = c.req.valid('param')
  const json = c.req.valid('json')
  const user = c.get('user')

  const column = await columnService.updateById(json, columnId, user.id)

  return c.json(column, 200)
})

columnRouter.openapi(updateColumnsOrderRoute, async c => {
  const { boardId } = c.req.valid('param')
  const json = c.req.valid('json')
  const user = c.get('user')

  const columns = await columnService.updateOrder(json, boardId, user.id)

  return c.json(columns, 200)
})

columnRouter.openapi(deleteColumnRoute, async c => {
  const { columnId } = c.req.valid('param')
  const user = c.get('user')

  await columnService.deleteById(columnId, user.id)

  return c.body(null, 204)
})
