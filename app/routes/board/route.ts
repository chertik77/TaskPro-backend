import type { BoardSchema } from '@/schemas'
import type { z } from '@hono/zod-openapi'

import { createProtectedRouter } from '@/lib'
import { boardService } from '@/services'

import {
  createBoardRoute,
  deleteBoardRoute,
  getAllBoardsRoute,
  getBoardByIdRoute,
  updateBoardRoute
} from './openapi'

export const boardRouter = createProtectedRouter()

boardRouter.openapi(getAllBoardsRoute, async c => {
  const user = c.get('user')

  const boards = await boardService.getAll(user.id)

  return c.json(boards, 200)
})

boardRouter.openapi(getBoardByIdRoute, async c => {
  const { boardId } = c.req.valid('param')
  const user = c.get('user')

  const board = await boardService.getById(boardId, user.id)

  return c.json(board)
})

boardRouter.openapi(createBoardRoute, async c => {
  const json = c.req.valid('json')
  const user = c.get('user')

  const board = (await boardService.create(json, user.id)) as z.infer<
    typeof BoardSchema
  >

  return c.json(board, 201)
})

boardRouter.openapi(updateBoardRoute, async c => {
  const { boardId } = c.req.valid('param')
  const json = c.req.valid('json')
  const user = c.get('user')

  const board = (await boardService.updateById(
    json,
    boardId,
    user.id
  )) as z.infer<typeof BoardSchema>

  return c.json(board, 200)
})

boardRouter.openapi(deleteBoardRoute, async c => {
  const { boardId } = c.req.valid('param')
  const user = c.get('user')

  await boardService.deleteById(boardId, user.id)

  return c.body(null, 204)
})
