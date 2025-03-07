import type { StringValue } from 'ms'

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface ProcessEnv {
      CLOUDINARY_API_KEY: string
      CLOUDINARY_API_SECRET: string
      CLOUDINARY_CLOUD_NAME: string
      DATABASE_URL: string
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      ACCESS_JWT_SECRET: string
      REFRESH_JWT_SECRET: string
      PORT: string
      API_PREFIX: string
      EMAIL_HOST: string
      EMAIL_PORT: string
      EMAIL_USER: string
      EMAIL_RECEIVER: string
      EMAIL_PASSWORD: string
      ACCESS_TOKEN_EXPIRES_IN: StringValue
      REFRESH_TOKEN_EXPIRES_IN: StringValue
    }
  }
}

export {}
