import { Icons } from '@prisma/client'
import * as z from 'zod'

import boardImages from '@/data/board-bg-images.json'

import { objectIdSchema, TitleSchema } from './shared.schema'

function zodEnumFromObjKeys<K extends string>(
  obj: Record<K, unknown>
): z.ZodEnum<[K, ...K[]]> {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[]

  return z.enum([firstKey, ...otherKeys])
}

export const AddBoardSchema = z.object({
  title: TitleSchema,
  icon: z.nativeEnum(Icons),
  background: zodEnumFromObjKeys(boardImages)
})

export const EditBoardSchema = AddBoardSchema.partial()

export const BoardParamsSchema = z.object({ boardId: objectIdSchema() })

export const UpdateOrderSchema = z.object({
  ids: z.array(objectIdSchema(), {
    message: 'Ids must be an array of valid ObjectIds'
  })
})
