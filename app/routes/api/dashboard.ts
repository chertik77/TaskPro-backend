import express from 'express'
import { authenticate } from 'middlewares/authenticate'
import { isValidId } from 'middlewares/isValidId'
import { validateBody } from 'decorators/validateBody'
import * as boardSchema from 'schemas/board'
import { addColumnSchema, editColumnSchema } from 'schemas/column'
import { addNewCardSchema, editCardSchema } from 'schemas/card'
import * as dashboardController from 'controllers/dashboard'
import * as columnController from 'controllers/column'
import * as cardController from 'controllers/card'

export const dashboardRouter = express.Router()

dashboardRouter.use(authenticate)

//! Dashboard
dashboardRouter.patch('/theme', validateBody(boardSchema.editThemeSchema), dashboardController.switchTheme) // Switch theme

dashboardRouter.post('/help', validateBody(boardSchema.needHelpSchema), dashboardController.sendEmail) // Send email 'Need help'

//! Boards
dashboardRouter.get('/', dashboardController.getAll) // Get all boards

dashboardRouter.get('/:boardId', isValidId, dashboardController.getById) // Get board by id

dashboardRouter.post('/', validateBody(boardSchema.addNewBoardSchema), dashboardController.add) // Add new board

dashboardRouter.patch('/:boardId', isValidId, validateBody(boardSchema.editBoardSchema), dashboardController.updateById) // Edit board

dashboardRouter.delete('/:boardId', isValidId, dashboardController.deleteById) // Delete board

//! Columns
dashboardRouter.post('/:boardId', isValidId, validateBody(addColumnSchema), columnController.add) // Add new column

dashboardRouter.patch('/:boardId/:columnId', isValidId, validateBody(editColumnSchema), columnController.updateById) // Edit column

dashboardRouter.delete('/:boardId/:columnId', isValidId, columnController.deleteById) // Delete column

//! Cards
dashboardRouter.post('/:boardId/:columnId', isValidId, validateBody(addNewCardSchema), cardController.add) // Add new card

dashboardRouter.patch('/:boardId/:columnId/:cardId', isValidId, validateBody(editCardSchema), cardController.updateById) // Edit card

dashboardRouter.delete('/:boardId/:columnId/:cardId', isValidId, cardController.deleteById) // Delete card

dashboardRouter.patch('/:boardId/:columnId/:cardId/:newColumnId', isValidId, cardController.changeCardColumn) // Change column for card