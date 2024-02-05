import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { transport } from 'utils/nodemailer'
import { Board } from 'models/Board'

const { SEND_EMAIL_FROM, SEND_EMAIL_TO } = process.env

//! Get all boards
export const getAll = async (req: Request, res: Response) => {
  const { _id: owner } = req.user

  const boards = await Board.find({ owner }, '-columns -background').populate(
    'owner',
    ['name', 'email', 'userTheme']
  )

  res.json({
    total: boards.length,
    boards
  })
}

//! Get board for boardName
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: title } = req.params

  const board = await Board.findOne({ title, owner }).populate('owner', [
    'name',
    'email',
    'userTheme'
  ])

  if (!board) {
    return next(createHttpError(404, `Board ${title} not found`))
  }

  res.json(board)
}

//! Add new board
export const add = async (req: Request, res: Response, next: NextFunction) => {
  const { _id: owner } = req.user
  const { title } = req.body

  const board = await Board.findOne({ title, owner })
  if (board) {
    return next(createHttpError(409, 'Board with the same name already exists'))
  }

  const newBoard = await Board.create({ ...req.body, owner })
  const extendedBoard = await newBoard.populate('owner', [
    'name',
    'email',
    'userTheme'
  ])

  res.status(201).json(extendedBoard)
}

//! Edit board
export const updateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: title } = req.params
  const { title: newTitle } = req.body

  if (newTitle && newTitle !== title) {
    const board = await Board.findOne({ title: newTitle, owner })
    if (board) {
      return next(
        createHttpError(409, 'Board with the same name already exists')
      )
    }
  }

  const updatedBoard = await Board.findOneAndUpdate(
    { title, owner },
    req.body,
    { fields: '-columns' }
  ).populate('owner', ['name', 'email', 'userTheme'])

  if (!updatedBoard) {
    return next(createHttpError(404, `Board ${title} not found`))
  }

  res.json(updatedBoard)
}

//! Delete board
export const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardName: title } = req.params

  const deletedBoard = await Board.findOneAndDelete({ title, owner })

  if (!deletedBoard) {
    return next(createHttpError(404, `Board ${title} not found`))
  }

  res.json({
    message: `Board ${title} deleted`
  })
}

//! Need help email
export const sendEmail = async (req: Request, res: Response) => {
  const { email, comment } = req.body

  const emailBody = {
    from: SEND_EMAIL_FROM,
    to: SEND_EMAIL_TO,
    subject: 'Need help',
    html: `
    <div>
     <h4>email: ${email}<h4/>
     <p>${comment}<p/>
    <div/>`
  }

  await transport.sendMail(emailBody)

  res.json({
    message: `Email sent`
  })
}
