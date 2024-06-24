declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLOUDINARY_API_KEY: string
      CLOUDINARY_API_SECRET: string
      CLOUDINARY_CLOUD_NAME: string
      DB_HOST: string
      JWT_SECRET: string
      ALLOWED_ORIGINS: string
      PORT: number
      EMAIL_HOST: string
      EMAIL_PORT: number
      EMAIL_USER: string
      EMAIL_RECEIVER: string
      EMAIL_PASSWORD: string
      ACESS_TOKEN_EXPIRES_IN: string
      REFRESH_TOKEN_EXPIRES_IN: string
    }
  }
}

export {}
