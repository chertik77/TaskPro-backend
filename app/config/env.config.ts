import 'dotenv/config'

import * as z from 'zod'

const availableEmailPorts = [25, 587, 465]

const envSchema = z.object({
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),
  REDIS_USERNAME: z.string(),
  REDIS_PASSWORD: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.preprocess(
    v => (v ? v : undefined),
    z.coerce.number().int().positive()
  ),
  NODE_ENV: z.enum(['development', 'production']),
  COOKIE_HTTP_ONLY: z
    .enum(['true', 'false'])
    .transform(value => value === 'true'),
  COOKIE_SECURE: z.enum(['true', 'false']).transform(value => value === 'true'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']),
  COOKIE_DOMAIN: z.string(),
  ACCESS_JWT_SECRET: z.string().transform(v => new TextEncoder().encode(v)),
  REFRESH_JWT_SECRET: z.string().transform(v => new TextEncoder().encode(v)),
  PORT: z.preprocess(
    v => (v ? v : undefined),
    z.coerce.number().int().positive()
  ),
  API_PREFIX: z.string(),
  ALLOWED_ORIGINS: z
    .string()
    .transform(v => v.split(','))
    .pipe(z.array(z.string().url())),
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
