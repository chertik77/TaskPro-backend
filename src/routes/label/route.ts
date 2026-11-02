import { createProtectedRouter } from '@/lib'
import { labelService } from '@/services'

import {
  createLabelRoute,
  deleteLabelRoute,
  getAllLabelsRoute,
  updateLabelRoute
} from './openapi'

export const labelRouter = createProtectedRouter()

labelRouter.openapi(getAllLabelsRoute, async c => {
  const user = c.get('user')

  const labels = await labelService.getAll(user.id)

  return c.json(labels, 200)
})

labelRouter.openapi(createLabelRoute, async c => {
  const json = c.req.valid('json')
  const user = c.get('user')

  const label = await labelService.create(json, user.id)

  return c.json(label, 201)
})

labelRouter.openapi(updateLabelRoute, async c => {
  const { labelId } = c.req.valid('param')
  const json = c.req.valid('json')
  const user = c.get('user')

  const label = await labelService.updateById(json, labelId, user.id)

  return c.json(label, 200)
})

labelRouter.openapi(deleteLabelRoute, async c => {
  const { labelId } = c.req.valid('param')
  const user = c.get('user')

  await labelService.deleteById(labelId, user.id)

  return c.body(null, 204)
})
