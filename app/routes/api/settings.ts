import { Router } from 'express'

import { settingsController } from '@/controllers'

export const settingsRouter = Router()

settingsRouter.get('/', settingsController.getAll)

settingsRouter.patch('/general', settingsController.updateGeneral)
settingsRouter.patch('/task', settingsController.updateTasks)
settingsRouter.patch('/label', settingsController.updateLabels)
settingsRouter.patch('/accessibility', settingsController.updateAccessibility)
