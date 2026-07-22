import { createProtectedRouter } from '@/lib'
import { settingsService } from '@/services'

import { zValidator } from '@/middlewares'

import {
  UpdateaccessibilitySettingsSchema,
  UpdateGeneralSettingsSchema,
  UpdateLabelSettingsSchema,
  UpdateTaskSettingsSchema
} from '@/schemas'

export const settingsRouter = createProtectedRouter()

settingsRouter.get('/', async c => {
  const user = c.get('user')

  const settings = await settingsService.getAll(user.id)

  return c.json(settings)
})

settingsRouter.patch(
  '/general',
  zValidator('json', UpdateGeneralSettingsSchema),
  async c => {
    const json = c.req.valid('json')
    const user = c.get('user')

    const settings = await settingsService.updateGeneral(json, user.id)

    return c.json(settings)
  }
)

settingsRouter.patch(
  '/task',
  zValidator('json', UpdateTaskSettingsSchema),
  async c => {
    const json = c.req.valid('json')
    const user = c.get('user')

    const settings = await settingsService.updateTasks(json, user.id)

    return c.json(settings)
  }
)

settingsRouter.patch(
  '/label',
  zValidator('json', UpdateLabelSettingsSchema),
  async c => {
    const json = c.req.valid('json')
    const user = c.get('user')

    const settings = await settingsService.updateLabels(json, user.id)

    return c.json(settings)
  }
)

settingsRouter.patch(
  'accessibility',
  zValidator('json', UpdateaccessibilitySettingsSchema),
  async c => {
    const json = c.req.valid('json')
    const user = c.get('user')

    const settings = await settingsService.updateAccessibility(json, user.id)

    return c.json(settings)
  }
)
