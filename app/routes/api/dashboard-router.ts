import {
  add,
  deleteById,
  getAll,
  getById,
  updateById,changeTheme
} from 'controllers/dashboard-controller'

import express from 'express'
import { authenticate } from 'middlewares/authenticate'

import { validateBody } from 'decorators/validateBody'
import * as movieSchemas from 'models/Movie' //замінити схему

import { isValidId } from 'middlewares/isValidId'

const movieAddValidate = validateBody(movieSchemas.movieAddSchema) //замінити схему

const movieUpdateFavoriteValidate = validateBody(
  movieSchemas.movieUpdateFavoriteSchema) // треба замінити схему

export const dashboardRouter = express.Router()

dashboardRouter.use(authenticate)

dashboardRouter.get('/',authenticate, getAll)

dashboardRouter.post('/', authenticate,movieAddValidate, add)


dashboardRouter.get('/:boardName',authenticate, isValidId, getById)


dashboardRouter.patch('/:boardName',authenticate,
  isValidId,
  movieUpdateFavoriteValidate,
  updateById
)

dashboardRouter.delete('/:boardName',authenticate, isValidId, deleteById)


// Add route functions for columns
dashboardRouter.post('/:boardName',authenticate, movieAddValidate, add)

dashboardRouter.patch('/:boardName/:columnId', authenticate,isValidId, updateById)

dashboardRouter.delete('/:boardName/:columnId',authenticate, isValidId, deleteById)


// Add route functions for tasks
dashboardRouter.post('/:boardName/:columnId',authenticate, movieAddValidate, //add
)

dashboardRouter.patch('/:boardName/:columnId/:taskId',authenticate, isValidId, //updateById
)

dashboardRouter.delete('/:boardName/:columnId/:taskId',authenticate, isValidId, //deleteById
)


// Add route function for edit user
dashboardRouter.put('/:userId',authenticate, isValidId, movieAddValidate, updateById
)


// Add route function for theme
dashboardRouter.patch(
  '/',authenticate, isValidId, changeTheme
);
//