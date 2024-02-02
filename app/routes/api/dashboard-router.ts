import express from 'express'
import { authenticate } from 'middlewares/authenticate'
import { validateBody } from '@/decorators/validateBody'
import * as schema from '@/schemas/board'
import * as dashboardController from '@/controllers/dashboard-controller'

export const dashboardRouter = express.Router()

dashboardRouter.use(authenticate)

// Boards
dashboardRouter.get('/', dashboardController.getAll) // Get all boards

dashboardRouter.get('/:boardName', dashboardController.getById) // Get board for boardName

dashboardRouter.post('/', validateBody(schema.addNewBoardSchema), dashboardController.add) // Add new board

dashboardRouter.patch('/:boardName', validateBody(schema.editBoardSchema), dashboardController.updateById) // Edit board

dashboardRouter.delete('/:boardName', dashboardController.removeById) // Delete board

// Dashboard
dashboardRouter.patch('/') // Switch theme

dashboardRouter.post('/help') // Send email 'Need help'