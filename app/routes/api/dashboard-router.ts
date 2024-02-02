import express from 'express'
import { authenticate } from 'middlewares/authenticate'

export const dashboardRouter = express.Router()

dashboardRouter.use(authenticate)

// Boards
dashboardRouter.get('/') // Get all boards

dashboardRouter.get('/:boardName') // Get board for boardName

dashboardRouter.post('/') // Add new board

dashboardRouter.patch('/:boardName') // Edit board

dashboardRouter.delete('/:boardName') // Delete board

// Dashboard
dashboardRouter.patch('/') // Switch theme

dashboardRouter.post('/help') // Send email 'Need help'