import nodemailer from 'nodemailer'

const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_PORT, EMAIL_HOST } = process.env

const nodemailerConfig = {
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
}

export const transport = nodemailer.createTransport(nodemailerConfig)
