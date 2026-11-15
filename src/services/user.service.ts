import type { HelpSchema } from '@/schemas'
import type { AuthVariables } from '@/types'
import type { z } from '@hono/zod-openapi'

import { HTTPException } from 'hono/http-exception'

import { env, resend } from '@/config'
import {
  supportRequestAdminTemplate,
  supportRequestUserTemplate
} from '@/emails/templates'
import { auth } from '@/lib'
import {
  AVATAR_FOLDER,
  deleteFromCloudinary,
  uploadToCloudinary
} from '@/utils'

class UserService {
  help = async (data: z.infer<typeof HelpSchema>) => {
    const supportRequestAdmin = supportRequestAdminTemplate({
      email: data.email,
      comment: data.comment
    })

    const supportRequestUser = supportRequestUserTemplate({
      comment: data.comment
    })

    const results = await Promise.allSettled([
      resend.emails.send({
        from: 'TaskPro <support@taskpro.qzz.io>',
        subject: '🆕 New Support Request',
        to: env.RESEND_RECEIVER,
        replyTo: data.email,
        html: supportRequestAdmin
      }),

      resend.emails.send({
        from: 'TaskPro <support@taskpro.qzz.io>',
        subject: 'Help Request',
        to: data.email,
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
      throw new HTTPException(500, {
        message:
          adminError?.message || userError?.message || 'Email sending failed'
      })
    }
  }

  uploadAvatar = async (
    file: File,
    user: AuthVariables['user'],
    headers: Headers
  ) => {
    const buffer = Buffer.from(await file.arrayBuffer())

    let uploadedImage

    try {
      uploadedImage = await uploadToCloudinary(buffer, AVATAR_FOLDER)
    } catch {
      throw new HTTPException(500, { message: 'Uploading avatar error' })
    }

    await auth.api.updateUser({
      headers,
      body: {
        image: uploadedImage.secure_url,
        imagePublicId: uploadedImage.public_id
      }
    })

    await deleteFromCloudinary(user.imagePublicId)

    return { image: uploadedImage.secure_url }
  }

  deleteAvatar = async (user: AuthVariables['user'], headers: Headers) => {
    await auth.api.updateUser({
      headers,
      body: { image: null, imagePublicId: null }
    })

    await deleteFromCloudinary(user.imagePublicId)

    return { image: null }
  }
}

export const userService = new UserService()
