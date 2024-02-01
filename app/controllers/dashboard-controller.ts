import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { Movie } from 'models/Movie'
import { User } from '@/models/User'

export const getAll = async (req: Request, res: Response) => {
  const { _id: owner } = req.user
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit
  const result = await Movie.find({ owner }, '-createdAt -updatedAt', {
    skip,
    limit
  }).populate('owner', 'name email')
  res.json(result)
}

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const result = await Movie.findById(id)  // треба замінити модель Movie

  if (!result) {
    return next(new createHttpError.NotFound(`Movie with id=${id} not found`))
  }

  res.json(result)
}

export const add = async (req: Request, res: Response) => {
  const { _id: owner } = req.user
  const result = await Movie.create({ ...req.body, owner }) // треба замінити модель Movie
  res.status(201).json(result)
}

export const updateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const result = await Movie.findByIdAndUpdate(id, req.body, { new: true }) // треба замінити модель Movie

  if (!result) {
    return next(new createHttpError.NotFound(`Movie with id=${id} not found`))
  }

  res.json(result)
}

export const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const result = await Movie.findByIdAndDelete(id) // треба замінити модель Movie

  if (!result) {
    return next(new createHttpError.NotFound(`Movie with id=${id} not found`))
  }

  res.json({ message: 'Delete success' })
}

// Add controller function for theme

export const changeTheme = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id } = req.user
  const result = await User.findByIdAndUpdate(_id, req.body, { new: true }) // змінити модель User
  if (!result) {
    return next(new createHttpError.NotFound(`?`))
  }
  res.json(result)
}