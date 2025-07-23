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
  COOKIE_SECRET: z.string(),
  COOKIE_SECURE: z.union([z.boolean(), z.literal('auto')]),
  COOKIE_DOMAIN: z.string(),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  SESSION_STORE_CHECK_PERIOD_MS: z.preprocess(
    a => parseInt(z.string().parse(a), 10),
    z.number().int().positive().min(1000)
  ),
  COOKIE_MAX_AGE: z.preprocess(
    a => parseInt(z.string().parse(a), 10),
    z.number().int().positive()
  ),
  PORT: z.preprocess(v => (v ? v : undefined), z.coerce.number().int()),
  API_PREFIX: z.string(),
  NODE_ENV: z.enum(['development', 'production']),
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
  EMAIL_PASSWORD: z.string()
})

// eslint-disable-next-line no-restricted-syntax
export const env = envSchema.parse(process.env)
