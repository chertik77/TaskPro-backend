import express from 'express'
import { authenticate } from 'middlewares/authenticate'

export const boardRouter = express.Router()

boardRouter.use(authenticate)

// Columns
boardRouter.get('/') // Get all columns of the board

boardRouter.get('/:columnId')

boardRouter.post('/')

boardRouter.patch('/:columnId')

boardRouter.delete('/:columnId')

// Tasks
boardRouter.get('/') // Get all tasks of the board

boardRouter.get('/:columnId/:taskId')

boardRouter.post('/:columnId/')

boardRouter.patch('/:columnId/:taskId')

boardRouter.delete('/:columnId/:taskId')

boardRouter.patch('/:columnId/:taskId/:newColumnId')