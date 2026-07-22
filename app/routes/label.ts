import { createProtectedRouter } from '@/lib'
import { labelService } from '@/services'

import { zValidator } from '@/middlewares'

import {
  CreateLabelSchema,
  LabelParamsSchema,
  UpdateLabelSchema
} from '@/schemas'

export const labelRouter = createProtectedRouter()

labelRouter.get('/', async c => {
  const user = c.get('user')

  const labels = await labelService.getAll(user.id)

  return c.json(labels)
})

labelRouter.post('/', zValidator('json', CreateLabelSchema), async c => {
  const json = c.req.valid('json')
  const user = c.get('user')

  const label = await labelService.create(json, user.id)

  return c.json(label)
})

labelRouter.patch(
  '/:labelId',
  zValidator('param', LabelParamsSchema),
  zValidator('json', UpdateLabelSchema),
  async c => {
    const { labelId } = c.req.valid('param')
    const json = c.req.valid('json')
    const user = c.get('user')

    const label = await labelService.updateById(json, labelId, user.id)

    return c.json(label)
  }
)

labelRouter.delete(
  '/:labelId',
  zValidator('param', LabelParamsSchema),
  async c => {
    const { labelId } = c.req.valid('param')
    const user = c.get('user')

    await labelService.deleteById(labelId, user.id)

    return c.status(204)
  }
)
