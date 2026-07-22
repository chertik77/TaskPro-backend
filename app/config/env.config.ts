import { loadEnvFile } from 'node:process'

import * as z from 'zod'

loadEnvFile(process.cwd() + '/.env')

const envSchema = z.object({
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  MICROSOFT_CLIENT_ID: z.string(),
  MICROSOFT_CLIENT_SECRET: z.string(),
  REDIS_USERNAME: z.string(),
  REDIS_PASSWORD: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().int().positive().min(1000).max(65535),
  PORT: z.coerce.number().int().positive().min(1000).max(65535),
  API_PREFIX: z.string().default(''),
  RP_ID: z.hostname(),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  ALLOWED_ORIGINS: z
    .string()
    .transform(v => v.split(','))
    .pipe(z.array(z.url())),
  RESEND_API_KEY: z.string(),
  RESEND_RECEIVER: z.email()
})

// eslint-disable-next-line no-restricted-syntax
export const env = envSchema.parse(process.env)
