import type { NextFunction, Request, Response } from 'express'
import type { Options } from 'nodemailer/lib/mailer'
import type { TypedRequestBody } from 'typings/typed-request'

import { User } from '@prisma/client'
import { hash } from 'bcrypt'
import cloudinary, { transport } from 'config'
import defaultAvatars from 'data/default-avatars.json'
import { Conflict, InternalServerError, NotAcceptable } from 'http-errors'
import { prisma } from 'prisma/prisma.client'

import { EditUserSchema, NeedHelpSchema, ThemeSchema } from 'utils/schemas'

class UserController {
  me = async (req: Request, res: Response) => {
    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
      omit: { password: true }
    })

    res.json(user)
  }

  update = async (
    { user, body, file }: TypedRequestBody<typeof EditUserSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const { id, avatarPublicId, email: userEmail } = user
    const { email, password } = body

    const isEmailExists =
      email && (await prisma.user.findUnique({ where: { email } }))

    if (email && email !== userEmail && isEmailExists) {
      return next(Conflict('Email already exist'))
    }

    const updateData: Partial<User> = { ...body }

    if (password) {
      updateData.password = await hash(password, 10)
    }

    if (file) {
      const extArr = ['jpeg', 'png']
      const ext = file.mimetype.split('/').pop()

      if (!extArr.includes(ext!)) {
        return next(NotAcceptable('File must have .jpeg or .png extension'))
      }

      try {
        const newAvatar = await cloudinary.uploader.upload(file.path, {
          folder: 'TaskPro/user_avatars'
        })

        if (avatarPublicId) {
          await cloudinary.uploader.destroy(avatarPublicId, {
            type: 'upload',
            resource_type: 'image'
          })
        }

        updateData.avatar = newAvatar.url
        updateData.avatarPublicId = newAvatar.public_id
      } catch {
        return next(InternalServerError('Uploading avatar error'))
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      omit: { password: true }
    })

    res.json(updatedUser)
  }

  help = async (
    { body }: TypedRequestBody<typeof NeedHelpSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const emailBody: Options = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: 'Need help',
      html: `
        <div>
         <h4>email: ${body.email}</h4>
         <p>${body.comment}</p>
        </div>`
    }

    try {
      await transport.sendMail(emailBody)
      res.json({ message: 'Email sent' })
    } catch {
      return next(InternalServerError('Sending email error'))
    }
  }

  updateTheme = async (
    { body, user }: TypedRequestBody<typeof ThemeSchema>,
    res: Response
  ) => {
    const updateData = !user.avatarPublicId
      ? {
          ...body,
          avatar: defaultAvatars[body.theme],
          avatarPublicId: null
        }
      : body

    const editedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      omit: { password: true }
    })

    res.json(editedUser)
  }
}

export const userController = new UserController()
