import { NeedHelpSchema } from '@/schemas/user'
import cloudinary from '@/utils/cloudinary'
import { transport } from '@/utils/nodemailer'
import bcrypt from 'bcrypt'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { User } from 'models/User'
import { TypedRequestBody } from 'zod-express-middleware'

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

  help: async (
    req: TypedRequestBody<typeof NeedHelpSchema>,
    res: Response,
    next: NextFunction
  ) => {
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

    const themeUrls = {
      light:
        'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_light.png',
      dark: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_dark.png',
      violet:
        'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_violet.png'
    }

    const theme: keyof typeof themeUrls =
      req.body.theme in themeUrls ? req.body.theme : 'light'

    const updateData = !user?.avatar?.publicId
      ? { ...req.body, avatar: { url: themeUrls[theme], publicId: '' } }
      : req.body

    const editedUser = await User.findByIdAndUpdate(id, updateData)

    res.json(editedUser)
  },

  me: async (req: Request, res: Response) => {
    const user = await User.findById(req.user.id)

    res.json(user)
  }
}
