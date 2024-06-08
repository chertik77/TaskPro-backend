import nodemailer from 'nodemailer'

const { SEND_EMAIL_FROM, SENDER_PASSWORD } = process.env

const nodemailerConfig = {
  host: 'smtp.meta.ua',
  port: 465,
  secure: true,
  auth: {
    user: SEND_EMAIL_FROM,
    pass: SENDER_PASSWORD
  }
}

export const transport = nodemailer.createTransport(nodemailerConfig)
