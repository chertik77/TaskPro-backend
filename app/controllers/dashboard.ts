import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { transport } from 'utils/nodemailer'
import { Board } from 'models/Board'
import { User } from 'models/User'

const { SEND_EMAIL_FROM, SEND_EMAIL_TO } = process.env

//! Get all boards
export const getAll = async (req: Request, res: Response) => {
  const { _id: owner } = req.user

  const boards = await Board.find({ owner }, '-columns -background')

  res.json({
    total: boards.length,
    data: boards
  })
}

//! Get board by id
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardId: _id } = req.params

  const board = await Board.findOne({ _id, owner })

  if (!board) {
    return next(createHttpError(404, `Board not found`))
  }

  res.json(board)
}

//! Add new board
export const add = async (req: Request, res: Response) => {
  const { _id: owner } = req.user

  const newBoard = await Board.create({ ...req.body, owner })

  res.status(201).json(newBoard)
}

//! Edit board
export const updateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: owner } = req.user
  const { boardId: _id } = req.params

  const updatedBoard = await Board.findOneAndUpdate(
    { _id, owner },
    req.body,
    { fields: '-columns' }
  )

  if (!updatedBoard) {
    return next(createHttpError(404, `Board not found`))
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
  const { boardId: _id } = req.params

  const deletedBoard = await Board.findOneAndDelete({ _id, owner }).select(
    '-columns'
  )

  if (!deletedBoard) {
    return next(createHttpError(404, `Board not found`))
  }

  res.json(deletedBoard)
}

//! Need help email
export const sendEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

  try {
    await transport.sendMail(emailBody)

    res.json({
      message: 'Email sent'
    })
  } catch {
    return next(createHttpError(500, 'Sending email error'))
  }
}

//! Switch theme
export const switchTheme = async (req: Request, res: Response) => {
  const { _id, avatarURL } = req.user
  const { userTheme } = req.body

  let editedUser

  if (!avatarURL.publicId) {
    switch (userTheme) {
      case 'light':
        editedUser = await User.findByIdAndUpdate(_id, {
          ...req.body,
          avatarURL: {
            url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_light.png',
            publicId: ''
          }
        })
        break

      case 'dark':
        editedUser = await User.findByIdAndUpdate(_id, {
          ...req.body,
          avatarURL: {
            url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_dark.png',
            publicId: ''
          }
        })
        break

      case 'violet':
        editedUser = await User.findByIdAndUpdate(_id, {
          ...req.body,
          avatarURL: {
            url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_violet.png',
            publicId: ''
          }
        })
        break

      default:
        editedUser = await User.findByIdAndUpdate(_id, {
          ...req.body,
          avatarURL: {
            url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_light.png',
            publicId: ''
          }
        })
        break
    }
  } else {
    editedUser = await User.findByIdAndUpdate(_id, req.body)
  }

  res.json({
    user: {
      _id: editedUser?._id,
      name: editedUser?.name,
      email: editedUser?.email,
      userTheme: editedUser?.userTheme,
      avatarURL: editedUser?.avatarURL
    }
  })
}
