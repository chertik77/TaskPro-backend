import { Icon } from '@prisma/client'
import * as z from 'zod'

import boardImages from '@/data/board-bg-images.json'

import { objectIdSchema } from './object-id.schema'

const zObjectKeys = <T extends Record<string, unknown>>(obj: T) => {
  const keys = Object.keys(obj) as Extract<keyof T, string>[]

  return z.enum(
    keys as [Extract<keyof T, string>, ...Extract<keyof T, string>[]]
  )
}

export const AddBoardSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  icon: z.enum(Icon),
  background: zObjectKeys(boardImages)
})

export const EditBoardSchema = AddBoardSchema.partial()

export const BoardParamsSchema = z.object({ boardId: objectIdSchema() })
