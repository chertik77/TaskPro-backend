import type { EditUserSchema, NeedHelpSchema } from '@/schemas'
import type { User } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import type { Options } from 'nodemailer/lib/mailer'
import type { TypedRequestBody } from 'zod-express-middleware'

import { prisma } from '@/prisma'
import { hash } from 'argon2'
import { Conflict, InternalServerError, NotAcceptable } from 'http-errors'

import cloudinary, { env, redisClient, transport } from '@/config'

class UserController {
  me = async (req: Request, res: Response) => {
    const cacheKey = `user:${req.user.id}`

    const cachedUser = await redisClient.get(cacheKey)

    if (cachedUser) {
      res.json(JSON.parse(cachedUser))
    } else {
      const user = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      await redisClient.set(cacheKey, JSON.stringify(user))

      res.json(user)
    }
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

    const updateData: Partial<User> = body

    if (password) {
      updateData.password = await hash(password)
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
      data: updateData
    })

    await redisClient.del(`user:${updatedUser.id}`)

    res.json(updatedUser)
  }

  help = async (
    { body }: TypedRequestBody<typeof NeedHelpSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const emailBody: Options = {
      from: env.EMAIL_USER,
      to: env.EMAIL_RECEIVER,
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
}

export const userController = new UserController()
