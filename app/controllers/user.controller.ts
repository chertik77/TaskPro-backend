import type { NeedHelpSchema } from '@/schemas'
import type { TypedRequestBody } from '@/types'
import type { NextFunction, Request, Response } from 'express'

import {
  supportRequestAdminTemplate,
  supportRequestUserTemplate
} from '@/emails/templates'
import { prisma } from '@/prisma'
import { InternalServerError } from 'http-errors'

import { env, redisClient, resend } from '@/config'

class UserController {
  me = async (req: Request, res: Response) => {
    // Disable caching for this route to prevent stale data
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    const cacheKey = `user:${req.user.id}`

    const cachedUser = await redisClient.get(cacheKey)

    if (cachedUser) {
      res.json(JSON.parse(cachedUser))
    } else {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      })

      await redisClient.set(cacheKey, JSON.stringify(user), 'EX', 5 * 60)

      res.json(user)
    }
  }

  // update = async (
  //   { user, body, file }: TypedRequestBody<typeof EditUserSchema>,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   const { id, avatarPublicId, email: userEmail } = user
  //   const { email, password } = body

  //   const isEmailExists =
  //     email && (await prisma.user.findFirst({ where: { email } }))

  //   if (email && email !== userEmail && isEmailExists) {
  //     return next(Conflict('Email already exist'))
  //   }

  //   const updateData: Partial<User> = body

  //   if (password) {
  //     updateData.password = await hash(password)
  //   }

  //   if (file) {
  //     const extArr = ['jpeg', 'png']
  //     const ext = file.mimetype.split('/').pop()

  //     if (!extArr.includes(ext!)) {
  //       return next(NotAcceptable('File must have .jpeg or .png extension'))
  //     }

  //     try {
  //       const newAvatar = await cloudinary.uploader.upload(file.path, {
  //         folder: 'TaskPro/user_avatars'
  //       })

  //       if (avatarPublicId) {
  //         await cloudinary.uploader.destroy(avatarPublicId, {
  //           type: 'upload',
  //           resource_type: 'image'
  //         })
  //       }

  //       updateData.avatar = newAvatar.url
  //       updateData.avatarPublicId = newAvatar.public_id
  //     } catch {
  //       return next(InternalServerError('Uploading avatar error'))
  //     }
  //   }

  //   const updatedUser = await prisma.user.update({
  //     where: { id },
  //     data: updateData
  //   })

  //   await redisClient.del(`user:${updatedUser.id}`)

  //   res.json(updatedUser)
  // }

  help = async (
    { body }: TypedRequestBody<typeof NeedHelpSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const supportRequestAdmin = supportRequestAdminTemplate({
      email: body.email,
      comment: body.comment
    })

    const supportRequestUser = supportRequestUserTemplate({
      comment: body.comment
    })

    const results = await Promise.allSettled([
      resend.emails.send({
        from: 'TaskPro <support@taskpro.qzz.io>',
        subject: '🆕 New Support Request',
        to: env.RESEND_RECEIVER,
        replyTo: body.email,
        html: supportRequestAdmin
      }),

      resend.emails.send({
        from: 'TaskPro <support@taskpro.qzz.io>',
        subject: 'Help Request',
        to: body.email,
        html: supportRequestUser
      })
    ])

    const [adminResult, userResult] = results

    const adminError =
      adminResult.status === 'rejected'
        ? adminResult.reason
        : adminResult.value?.error

    const userError =
      userResult.status === 'rejected'
        ? userResult.reason
        : userResult.value?.error

    if (adminError || userError) {
      return next(
        InternalServerError(
          adminError?.message || userError?.message || 'Email sending failed'
        )
      )
    }

    res.json({ message: 'Email sent' })
  }
}

export const userController = new UserController()
