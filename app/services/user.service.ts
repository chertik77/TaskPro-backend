import type { HelpSchema } from '@/schemas'
import type { AuthVariables } from '@/types'
import type z from 'zod'

import {
  supportRequestAdminTemplate,
  supportRequestUserTemplate
} from '@/emails/templates'
import { auth } from '@/lib'
import { HTTPException } from 'hono/http-exception'

import cloudinary, { env, resend } from '@/config'

import { uploadToCloudinary } from '@/utils'

class UserService {
  private readonly AVATAR_FOLDER = 'TaskPro/user_avatars'

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
      uploadedImage = await uploadToCloudinary({
        file: `data:${file.type};base64,${buffer.toString('base64')}`,
        folder: this.AVATAR_FOLDER
      })
    } catch {
      throw new HTTPException(500, { message: 'Uploading avatar error' })
    }

    await auth.api.updateUser({
      headers,
      body: {
        image: uploadedImage.url,
        imagePublicId: uploadedImage.public_id
      }
    })

    await this.destroyAvatar(user.imagePublicId)

    return { image: uploadedImage.url }
  }

  deleteAvatar = async (user: AuthVariables['user'], headers: Headers) => {
    await auth.api.updateUser({
      headers,
      body: { image: null, imagePublicId: null }
    })

    await this.destroyAvatar(user.imagePublicId)

    return { image: null }
  }

  private destroyAvatar = async (imagePublicId: string | null | undefined) => {
    if (!imagePublicId) return

    try {
      await cloudinary.uploader.destroy(imagePublicId, {
        type: 'upload',
        resource_type: 'image'
      })
    } catch (error) {
      console.error('Failed to delete avatar', imagePublicId, error)
    }
  }
}

export const userService = new UserService()
