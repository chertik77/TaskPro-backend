import { z } from '@hono/zod-openapi'

export const HelpSchema = z.object({
  email: z.email().openapi({ example: 'user@example.com' }),
  comment: z.string().min(5).openapi({
    example: 'Need help with the Kanban board feature.'
  })
})

export const HelpResponseSchema = z.object({
  message: z.string().openapi({ example: 'Email sent' })
})

const AVATAR_MAX_SIZE = 5 * 1024 * 1024

const AVATAR_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif'
]

export const UploadAvatarSchema = z.object({
  avatar: z
    .instanceof(File)
    .refine(file => file.size > 0, 'Avatar file is required')
    .refine(file => file.size <= AVATAR_MAX_SIZE, 'Avatar must be 5MB or less')
    .refine(
      file => AVATAR_ALLOWED_TYPES.includes(file.type),
      'Avatar must be a .jpeg, .png, .webp or .avif image'
    )
    .openapi({ type: 'string', format: 'binary' })
})

export const AvatarSchema = z
  .object({
    image: z.url().nullable().openapi({
      example:
        'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatars/avatar.png'
    })
  })
  .openapi('Avatar')
