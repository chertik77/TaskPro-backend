import { createTransport } from 'nodemailer'

const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_PORT, EMAIL_HOST } = process.env

export const transport = createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
})
