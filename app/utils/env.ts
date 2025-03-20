import 'dotenv/config'

import * as z from 'zod'

const availableEmailPorts = [25, 587, 465]

const envSchema = z.object({
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  DATABASE_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  ACCESS_JWT_SECRET: z.string().transform(v => new TextEncoder().encode(v)),
  REFRESH_JWT_SECRET: z.string().transform(v => new TextEncoder().encode(v)),
  PORT: z.preprocess(v => (v ? v : undefined), z.coerce.number().int()),
  API_PREFIX: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z
    .number({ coerce: true })
    .refine(v => availableEmailPorts.includes(v), {
      message: `Email port must be one of the following: ${availableEmailPorts.join(', ')}`
    }),
  EMAIL_USER: z.string().email(),
  EMAIL_RECEIVER: z.string().email(),
  EMAIL_PASSWORD: z.string(),
  ACCESS_JWT_EXPIRES_IN: z.string(),
  REFRESH_JWT_EXPIRES_IN: z.string(),
  ACCESS_JWT_ALGORITHM: z.string(),
  REFRESH_JWT_ALGORITHM: z.string()
})

// eslint-disable-next-line no-restricted-syntax
export const env = envSchema.parse(process.env)
