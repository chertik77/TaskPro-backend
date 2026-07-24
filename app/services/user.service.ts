import type { HelpSchema } from '@/schemas'
import type z from 'zod'

import {
  supportRequestAdminTemplate,
  supportRequestUserTemplate
} from '@/emails/templates'
import { HTTPException } from 'hono/http-exception'

import { env, resend } from '@/config'

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
}

export const userService = new UserService()
