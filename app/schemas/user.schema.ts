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
