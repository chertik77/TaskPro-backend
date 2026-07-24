import { createProtectedRouter } from '@/lib'
import { settingsService } from '@/services'

import {
  getAllSettingsRoute,
  updateAccessibilitySettingsRoute,
  updateGeneralSettingsRoute,
  updateLabelSettingsRoute,
  updateTaskSettingsRoute
} from './openapi'

export const settingsRouter = createProtectedRouter()

settingsRouter.openapi(getAllSettingsRoute, async c => {
  const user = c.get('user')

  const settings = await settingsService.getAll(user.id)

  return c.json(settings, 200)
})

settingsRouter.openapi(updateGeneralSettingsRoute, async c => {
  const json = c.req.valid('json')
  const user = c.get('user')

  const settings = await settingsService.updateGeneral(json, user.id)

  return c.json(settings, 200)
})

settingsRouter.openapi(updateTaskSettingsRoute, async c => {
  const json = c.req.valid('json')
  const user = c.get('user')

  const settings = await settingsService.updateTasks(json, user.id)

  return c.json(settings, 200)
})

settingsRouter.openapi(updateLabelSettingsRoute, async c => {
  const json = c.req.valid('json')
  const user = c.get('user')

  const settings = await settingsService.updateLabels(json, user.id)

  return c.json(settings, 200)
})

settingsRouter.openapi(updateAccessibilitySettingsRoute, async c => {
  const json = c.req.valid('json')
  const user = c.get('user')

  const settings = await settingsService.updateAccessibility(json, user.id)

  return c.json(settings, 200)
})
