import bcrypt from 'bcrypt'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { User } from 'models/User'
import cloudinary from 'utils/cloudinary'

const { JWT_SECRET } = process.env

//! Sing up
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (user) {
    return next(createHttpError(409, 'Email already exist'))
  }

  const hashPassword = await bcrypt.hash(password, 10)

  await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL: {
      url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_light.png'
    }
  })

  const newUser = await User.findOne({ email })
  if (!newUser) {
    return next(createHttpError(404, `User not found`))
  }

  const { _id: id } = newUser
  const token = jwt.sign({ id }, JWT_SECRET as jwt.Secret, { expiresIn: '1d' })
  const activeUser = await User.findByIdAndUpdate(id, { token })

  res.status(201).json({
    token: activeUser?.token,
    user: {
      name: activeUser?.name,
      email: activeUser?.email,
      avatarURL: activeUser?.avatarURL,
      userTheme: activeUser?.userTheme
    }
  })
}

//! Sing in
export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return next(createHttpError(401, 'Email or password invalid'))
  }

  const passwordCompare = await bcrypt.compare(password, user.password)

  if (!passwordCompare) {
    return next(createHttpError(401, 'Email or password invalid'))
  }

  const { _id: id } = user
  const token = jwt.sign({ id }, JWT_SECRET as jwt.Secret, { expiresIn: '1d' })
  const activeUser = await User.findByIdAndUpdate(id, { token })

  res.json({
    token: activeUser?.token,
    user: {
      name: activeUser?.name,
      email: activeUser?.email,
      avatarURL: activeUser?.avatarURL,
      userTheme: activeUser?.userTheme
    }
  })
}

//! Get current
export const getCurrent = (req: Request, res: Response) => {
  const { name, email, avatarURL, userTheme } = req.user

  res.json({
    user: {
      name,
      email,
      avatarURL,
      userTheme
    }
  })
}

//! Edit user
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id } = req.user
  const { email } = req.body

  let avatar = null

  if (req.file) {
    const extArr = ['jpeg', 'png']

    const fileMimetype = req.file.mimetype.split('/')
    const ext = fileMimetype[fileMimetype.length - 1]

    if (!extArr.includes(ext)) {
      return next(
        createHttpError(400, 'File must have .jpeg or .png extension')
      )
    }

    avatar = await cloudinary.uploader.upload(req.file.path, {
      folder: 'TaskPro/user_avatars'
    })

    const userById = await User.findById(_id)
    if (userById && userById.avatarURL && userById.avatarURL.publicId) {
      await cloudinary.uploader.destroy(userById.avatarURL.publicId, {
        type: 'upload',
        resource_type: 'image'
      })
    }
  }

  if (email) {
    const userById = await User.findById(_id)
    const userByEmail = await User.findOne({ email })
    if (userByEmail && userById?.email !== email) {
      return next(createHttpError(409, 'Email already exist'))
    }
  }

  let updatedUser

  if (avatar) {
    updatedUser = await User.findByIdAndUpdate(_id, {
      ...req.body,
      avatarURL: {
        url: avatar.url,
        publicId: avatar.public_id
      }
    })
  } else {
    updatedUser = await User.findByIdAndUpdate(_id, req.body)
  }

  res.json({
    user: {
      name: updatedUser?.name,
      email: updatedUser?.email,
      userTheme: updatedUser?.userTheme,
      avatarURL: updatedUser?.avatarURL
    }
  })
}

//! Sing out
export const logout = async (req: Request, res: Response) => {
  const { _id } = req.user
  await User.findByIdAndUpdate(_id, { token: '' })

  res.status(204).json({})
}
