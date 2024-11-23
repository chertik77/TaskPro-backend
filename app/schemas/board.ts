import { Priority } from '@prisma/client'
import boardImages from 'data/board-bg-images.json'
import * as z from 'zod'

function zodEnumFromObjKeys<K extends string>(
  obj: Record<K, unknown>
): z.ZodEnum<[K, ...K[]]> {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[]
  return z.enum([firstKey, ...otherKeys])
}

export const AddBoardSchema = z.object({
  title: z.string().min(3),
  icon: z.string(),
  background: zodEnumFromObjKeys(boardImages)
})

export const EditBoardSchema = AddBoardSchema.partial()

export const BoardParams = z.object({ boardId: z.string() })

export const BoardQuery = z.object({
  priority: z.nativeEnum(Priority).optional(),
  sortBy: z.union([z.literal('asc'), z.literal('desc')]).optional()
})
