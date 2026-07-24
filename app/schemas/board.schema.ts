import { z } from '@hono/zod-openapi'
import { Icon } from '@prisma/client'

import boardImages from '@/data/board-bg-images.json'

import { ColumnSchema } from './column.schema'
import { ObjectIdSchema } from './object-id.schema'

const zObjectKeys = <T extends Record<string, unknown>>(obj: T) => {
  const keys = Object.keys(obj) as Extract<keyof T, string>[]

  return z.enum(
    keys as [Extract<keyof T, string>, ...Extract<keyof T, string>[]]
  )
}

const BoardIconSchema = z.enum(Icon).openapi('BoardIcon')
const BoardBackgroundIdSchema =
  zObjectKeys(boardImages).openapi('BoardBackgroundId')
const BoardBackground = z
  .object({
    identifier: BoardBackgroundIdSchema,
    url: z.url().nullable().openapi({
      example:
        'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099093/TaskPro/board_bg_images/desk/nfxep55xgvpq7xitemq1.jpg'
    })
  })
  .openapi('BoardBackground')

export const BoardSchema = z
  .object({
    id: ObjectIdSchema,
    title: z.string().min(3).openapi({ example: 'Project office' }),
    icon: BoardIconSchema.openapi({ example: Icon.layout }),
    background: BoardBackground,
    userId: ObjectIdSchema,
    columns: z.array(ColumnSchema),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .openapi('Board')

export const CreateBoardSchema = BoardSchema.pick({
  title: true,
  icon: true
}).extend({ background: BoardBackgroundIdSchema })

export const UpdateBoardSchema = CreateBoardSchema.partial()

export const BoardParamsSchema = z.object({ boardId: ObjectIdSchema })
