import { createTransport } from 'nodemailer'

import { env } from '@/utils'

const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_PORT, EMAIL_HOST } = env

export const transport = createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
})
