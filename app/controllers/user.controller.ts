import type { NeedHelpSchema } from '@/schemas'
import type { TypedRequestBody } from '@/types'
import type { NextFunction, Response } from 'express'

import {
  supportRequestAdminTemplate,
  supportRequestUserTemplate
} from '@/emails/templates'
import { InternalServerError } from 'http-errors'

import { env, resend } from '@/config'

class UserController {
  // update = async (
  //   { user, body, headers, file }: TypedRequestBody<typeof UpdateUserSchema>,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   // @ts-expect-error it exists
  //   const { imagePublicId } = user
  //   const { email, currentPassword, newPassword, ...data } = body

  //   if (email) auth.api.changeEmail({ body: { newEmail: email } })

  //   if (currentPassword && newPassword) {
  //     auth.api.changePassword({
  //       body: { currentPassword, newPassword }
  //     })
  //   }

  //   const updateData: Partial<User> = data

  //   if (file) {
  //     const extArr = ['jpeg', 'png', 'jpg', 'webp']
  //     const ext = file.mimetype.split('/').pop()

  //     if (!extArr.includes(ext!)) {
  //       return next(
  //         NotAcceptable(
  //           'File must have .jpeg or .png or .jpg or .webp extension'
  //         )
  //       )
  //     }

  //     try {
  //       const newImage = await uploadToCloudinary({
  //         file: file.path,
  //         folder: 'TaskPro/user_avatars'
  //       })

  //       if (imagePublicId) {
  //         await cloudinary.uploader.destroy(imagePublicId, {
  //           type: 'upload',
  //           resource_type: 'image'
  //         })
  //       }

  //       updateData.image = newImage.url
  //       // @ts-expect-error it exists
  //       updateData.imagePublicId = newImage.public_id
  //     } catch {
  //       return next(InternalServerError('Uploading avatar error'))
  //     }
  //   }

  //   console.log(updateData)

  //   const updatedUser = await auth.api.updateUser({
  //     headers: fromNodeHeaders(headers),
  //     body: updateData,
  //     asResponse: true
  //   })

  //   console.log(updatedUser)

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
