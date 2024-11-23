import { Router } from 'express'
import { User } from '@prisma/client'
import { prisma } from 'app'
import bcrypt from 'bcrypt'
import cloudinary from 'config/cloudinary.config'
import { transport } from 'config/nodemailer.config'
import defaultAvatars from 'data/default-avatars.json'
import createHttpError from 'http-errors'
import { validateRequestBody } from 'zod-express-middleware'

import { authenticate, upload } from 'middlewares'

import { EditUserSchema, NeedHelpSchema, ThemeSchema } from 'schemas/user'

export const userRouter = Router()

userRouter.use(authenticate)

userRouter.get('/me', async (req, res) => {
  const user = await prisma.user.findFirst({
    where: { id: req.user.id },
    omit: { password: true }
  })

  res.json(user)
})

userRouter.put(
  '/',
  upload.single('avatar'),
  validateRequestBody(EditUserSchema),
  async ({ user, body, file }, res, next) => {
    const { id, avatarPublicId, email: userEmail } = user
    const { email, password } = body

    const isEmailExists =
      email && (await prisma.user.findUnique({ where: { email } }))

    if (email && email !== userEmail && isEmailExists) {
      return next(createHttpError(409, 'Email already exist'))
    }

    const updateData: Partial<User> = { ...body }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    if (file) {
      const extArr = ['jpeg', 'png']
      const ext = file.mimetype.split('/').pop()

      if (!extArr.includes(ext!)) {
        return next(
          createHttpError(400, 'File must have .jpeg or .png extension')
        )
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
        return next(createHttpError(500, 'Uploading avatar error'))
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      omit: { password: true }
    })

    res.json(updatedUser)
  }
)

userRouter.post(
  '/help',
  validateRequestBody(NeedHelpSchema),
  async (req, res, next) => {
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
  }
)

userRouter.put('/theme', validateRequestBody(ThemeSchema), async (req, res) => {
  const user = await prisma.user.findFirst({
    where: { id: req.user.id },
    omit: { password: true }
  })

  const updateData = !user?.avatarPublicId
    ? {
        ...req.body,
        avatar: defaultAvatars[req.body.theme],
        avatarPublicId: null
      }
    : req.body

  const editedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData
  })

  res.json(editedUser)
})
