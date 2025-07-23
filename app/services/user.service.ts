import type { EditUserSchema, NeedHelpSchema } from '@/schemas'
import type { User } from '@prisma/client'
import type { Options } from 'nodemailer/lib/mailer'
import type z from 'zod'

import { prisma } from '@/prisma'
import { hash } from 'argon2'

import cloudinary, { env, transport } from '@/config'

export const userService = {
  findById: async (id: string) => {
    const user = await prisma.user.findFirst({
      where: { id }
    })

    return user
  },

  updateById: async (
    user: User,
    input: z.infer<typeof EditUserSchema>,
    file: Express.Multer.File | undefined
  ) => {
    const { id, avatarPublicId, email: userEmail } = user

    const { email, password } = input

    const isEmailExists =
      email && (await prisma.user.findUnique({ where: { email } }))

    if (email && email !== userEmail && isEmailExists) {
      throw new Error('Email already exist')
    }

    const updateData: Partial<User> = input

    if (password) {
      updateData.password = await hash(password)
    }

    if (file) {
      const extArr = ['jpeg', 'png']
      const ext = file.mimetype.split('/').pop()

      if (!extArr.includes(ext!)) {
        throw new Error('File must have .jpeg or .png extension')
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
        throw new Error('File upload error')
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    })

    return updatedUser
  },

  sendHelpRequest: async (input: z.infer<typeof NeedHelpSchema>) => {
    const emailBody: Options = {
      from: env.EMAIL_USER,
      to: env.EMAIL_RECEIVER,
      subject: 'Need help',
      html: `
        <div>
         <h4>email: ${input.email}</h4>
         <p>${input.comment}</p>
        </div>`
    }

    try {
      return await transport.sendMail(emailBody)
    } catch {
      throw new Error('Sending email error')
    }
  }
}
