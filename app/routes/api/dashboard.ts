import express from 'express'
import { authenticate } from 'middlewares/authenticate'
import { isValidId } from 'middlewares/isValidId'
import { validateBody } from 'decorators/validateBody'
import * as boardSchema from 'schemas/board'
import { addColumnSchema, editColumnSchema } from 'schemas/column'
import { addNewTaskSchema, editTaskSchema } from 'schemas/task'
import * as dashboardController from 'controllers/dashboard'
import * as columnController from 'controllers/column'
import * as taskController from 'controllers/task'

export const dashboardRouter = express.Router()

dashboardRouter.use(authenticate)

//! Dashboard
dashboardRouter.patch('/', validateBody(boardSchema.editThemeSchema), dashboardController.switchTheme) // Switch theme

dashboardRouter.post('/help', validateBody(boardSchema.needHelpSchema), dashboardController.sendEmail) // Send email 'Need help'

//! Boards
dashboardRouter.get('/', dashboardController.getAll) // Get all boards

dashboardRouter.get('/:boardName', dashboardController.getById) // Get board by title

dashboardRouter.post('/', validateBody(boardSchema.addNewBoardSchema), dashboardController.add) // Add new board

dashboardRouter.patch('/:boardName', validateBody(boardSchema.editBoardSchema), dashboardController.updateById) // Edit board

dashboardRouter.delete('/:boardName', dashboardController.deleteById) // Delete board

//! Columns
dashboardRouter.get('/:boardName/columns', columnController.getAll) // Get all columns

dashboardRouter.post('/:boardName', validateBody(addColumnSchema), columnController.add) // Add new column

dashboardRouter.patch('/:boardName/:columnId', isValidId, validateBody(editColumnSchema), columnController.updateById) // Edit column

dashboardRouter.delete('/:boardName/:columnId', isValidId, columnController.deleteById) // Delete column

//! Tasks
dashboardRouter.post('/:boardName/:columnId', isValidId, validateBody(addNewTaskSchema), taskController.add) // Add new task

dashboardRouter.patch('/:boardName/:columnId/:taskId', isValidId, validateBody(editTaskSchema), taskController.updateById) // Edit task

dashboardRouter.delete('/:boardName/:columnId/:taskId', isValidId, taskController.deleteById) // Delete task

dashboardRouter.patch('/:boardName/:columnId/:taskId/:newColumnId', isValidId, taskController.changeTaskColumn) // Change column for task