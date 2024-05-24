import cloudinary from '@/utils/cloudinary'
import { transport } from '@/utils/nodemailer'
import bcrypt from 'bcrypt'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { User } from 'models/User'

class Controller {
  update = async (req: Request, res: Response, next: NextFunction) => {
    const { id, email: userEmail, avatar } = req.user

    const { email, password } = req.body

    if (email && email !== userEmail) {
      const isEmailExists = await User.findOne({ email })
      if (isEmailExists) {
        return next(createHttpError(409, 'Email already exist'))
      }
    }

    let newPassword

    if (password) {
      newPassword = await bcrypt.hash(password, 10)
    }

    let newAvatar

    if (req.file) {
      const extArr = ['jpeg', 'png']

      const fileMimetype = req.file.mimetype.split('/')
      const ext = fileMimetype[fileMimetype.length - 1]

      if (!extArr.includes(ext)) {
        return next(
          createHttpError(400, 'File must have .jpeg or .png extension')
        )
      }

      try {
        newAvatar = await cloudinary.uploader.upload(req.file.path, {
          folder: 'TaskPro/user_avatars'
        })

        if (avatar.publicId) {
          await cloudinary.uploader.destroy(avatar.publicId, {
            type: 'upload',
            resource_type: 'image'
          })
        }
      } catch {
        return next(createHttpError(500, 'Uploading avatar error'))
      }
    }

    let updatedUser

    if (newAvatar && newPassword) {
      updatedUser = await User.findByIdAndUpdate(id, {
        ...req.body,
        password: newPassword,
        avatar: {
          url: newAvatar.url,
          publicId: newAvatar.public_id
        }
      })
    } else if (newAvatar) {
      updatedUser = await User.findByIdAndUpdate(id, {
        ...req.body,
        avatar: {
          url: newAvatar.url,
          publicId: newAvatar.public_id
        }
      })
    } else if (newPassword) {
      updatedUser = await User.findByIdAndUpdate(id, {
        ...req.body,
        password: newPassword
      })
    } else {
      updatedUser = await User.findByIdAndUpdate(id, req.body)
    }

    res.json({
      id: updatedUser?.id,
      name: updatedUser?.name,
      email: updatedUser?.email,
      theme: updatedUser?.theme,
      avatar: updatedUser?.avatar?.url
    })
  }

  help = async (req: Request, res: Response, next: NextFunction) => {
    const { email, comment } = req.body

    const emailBody = {
      from: process.env.SEND_EMAIL_FROM,
      to: process.env.SEND_EMAIL_TO,
      subject: 'Need help',
      html: `
      <div>
       <h4>email: ${email}</h4>
       <p>${comment}</p>
      </div>`
    }

    try {
      await transport.sendMail(emailBody)

      res.json({ message: 'Email sent' })
    } catch {
      return next(createHttpError(500, 'Sending email error'))
    }
  }

  changeTheme = async (req: Request, res: Response) => {
    const { id, avatar } = req.user

    const editedUser = await User.findByIdAndUpdate(id, {
      ...req.body,
      avatar: {
        url:
          !avatar.publicId && req.body.theme === 'light'
            ? 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_light.png'
            : !avatar.publicId && req.body.theme === 'dark'
            ? 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_dark.png'
            : 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_violet.png',
        publicId: ''
      }
    })

    res.json(editedUser)
  }
}

export const UserController = new Controller()
