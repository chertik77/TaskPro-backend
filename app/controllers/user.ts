import type { NextFunction, Request, Response } from 'express'

import bcrypt from 'bcrypt'
import cloudinary from 'config/cloudinary.config'
import { transport } from 'config/nodemailer.config'
import createHttpError from 'http-errors'

import { User } from 'models/User'

import { themeAvatarUrls } from 'utils/theme-avatar-urls'

export const userController = {
  update: async (req: Request, res: Response, next: NextFunction) => {
    const { id, avatar, email: userEmail } = req.user
    const { email, password } = req.body

    const isEmailExists = await User.findOne({ email })

    if (email && email !== userEmail && isEmailExists) {
      return next(createHttpError(409, 'Email already exist'))
    }

    // eslint-disable-next-line prefer-const
    let updateData = { ...req.body }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    if (req.file) {
      const extArr = ['jpeg', 'png']
      const ext = req.file.mimetype.split('/').pop()

      if (!extArr.includes(ext!)) {
        return next(
          createHttpError(400, 'File must have .jpeg or .png extension')
        )
      }

      try {
        const newAvatar = await cloudinary.uploader.upload(req.file.path, {
          folder: 'TaskPro/user_avatars'
        })

        if (avatar.publicId) {
          await cloudinary.uploader.destroy(avatar.publicId, {
            type: 'upload',
            resource_type: 'image'
          })
        }

        updateData.avatar = {
          url: newAvatar.url,
          publicId: newAvatar.public_id
        }
      } catch {
        return next(createHttpError(500, 'Uploading avatar error'))
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData)

    res.json(updatedUser)
  },

  help: async (req: Request, res: Response, next: NextFunction) => {
    const emailBody = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: 'Need help',
      html: `
      <div>
       <h4>email: ${req.body.email}</h4>
       <p>${req.body.comment}</p>
      </div>`
    }

    try {
      await transport.sendMail(emailBody)
      res.json({ message: 'Email sent' })
    } catch (e) {
      return next(createHttpError(500, 'Sending email error'))
    }
  },

  changeTheme: async (req: Request, res: Response) => {
    const { id } = req.user

    const user = await User.findById(id)

    const theme: keyof typeof themeAvatarUrls =
      req.body.theme in themeAvatarUrls ? req.body.theme : 'light'

    const updateData = !user?.avatar?.publicId
      ? { ...req.body, avatar: { url: themeAvatarUrls[theme], publicId: '' } }
      : req.body

    const editedUser = await User.findByIdAndUpdate(id, updateData)

    res.json(editedUser)
  },

  me: async (req: Request, res: Response) => {
    const user = await User.findById(req.user.id)

    res.json(user)
  }
}
