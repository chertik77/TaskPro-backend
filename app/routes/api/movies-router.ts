import {
  add,
  deleteById,
  getAll,
  getById,
  updateById
} from 'controllers/movies-controller'
import { validateBody } from 'decorators/validateBody'
import express from 'express'
import { authenticate } from 'middlewares/authenticate'
import { isValidId } from 'middlewares/isValidId'
import * as movieSchemas from '@/models/Board'

const movieAddValidate = validateBody(movieSchemas.movieAddSchema)
const movieUpdateFavoriteValidate = validateBody(
  movieSchemas.movieUpdateFavoriteSchema
)

export const moviesRouter = express.Router()

moviesRouter.use(authenticate)

moviesRouter.get('/', getAll)

moviesRouter.get('/:id', isValidId, getById)

moviesRouter.post('/', movieAddValidate, add)

moviesRouter.put('/:id', isValidId, movieAddValidate, updateById)

moviesRouter.patch(
  '/:id/favorite',
  isValidId,
  movieUpdateFavoriteValidate,
  updateById
)

moviesRouter.delete('/:id', isValidId, deleteById)
