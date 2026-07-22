import { createProtectedRouter } from '@/lib'
import { boardService } from '@/services'

import { zValidator } from '@/middlewares'

import {
  BoardParamsSchema,
  CreateBoardSchema,
  UpdateBoardSchema
} from '@/schemas'

export const boardRouter = createProtectedRouter()

boardRouter.get('/', async c => {
  const user = c.get('user')

  const boards = await boardService.getAll(user.id)

  return c.json(boards)
})

boardRouter.get(
  '/:boardId',
  zValidator('param', BoardParamsSchema),
  async c => {
    const { boardId } = c.req.valid('param')
    const user = c.get('user')

    const board = await boardService.getById(boardId, user.id)

    return c.json(board)
  }
)

boardRouter.post('/', zValidator('json', CreateBoardSchema), async c => {
  const json = c.req.valid('json')
  const user = c.get('user')

  const board = await boardService.create(json, user.id)

  return c.json(board)
})

boardRouter.patch(
  '/:boardId',
  zValidator('param', BoardParamsSchema),
  zValidator('json', UpdateBoardSchema),
  async c => {
    const { boardId } = c.req.valid('param')
    const json = c.req.valid('json')
    const user = c.get('user')

    const board = await boardService.updateById(json, boardId, user.id)

    return c.json(board)
  }
)

boardRouter.delete(
  '/:boardId',
  zValidator('param', BoardParamsSchema),
  async c => {
    const { boardId } = c.req.valid('param')
    const user = c.get('user')

    await boardService.deleteById(boardId, user.id)

    return c.status(204)
  }
)
