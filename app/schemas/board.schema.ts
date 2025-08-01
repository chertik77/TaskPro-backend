import { Icon } from '@prisma/client'
import * as z from 'zod'

import boardImages from '@/data/board-bg-images.json'

import { objectIdSchema } from './object-id.schema'

function zodEnumFromObjKeys<K extends string>(
  obj: Record<K, unknown>
): z.ZodEnum<[K, ...K[]]> {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[]

  return z.enum([firstKey, ...otherKeys])
}

export const AddBoardSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  icon: z.nativeEnum(Icon),
  background: zodEnumFromObjKeys(boardImages)
})

export const EditBoardSchema = AddBoardSchema.partial()

export const BoardParamsSchema = z.object({ boardId: objectIdSchema() })
