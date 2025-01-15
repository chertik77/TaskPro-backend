import { Icons } from '@prisma/client'
import * as z from 'zod'

import boardImages from '@/data/board-bg-images.json'

function zodEnumFromObjKeys<K extends string>(
  obj: Record<K, unknown>
): z.ZodEnum<[K, ...K[]]> {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[]
  return z.enum([firstKey, ...otherKeys])
}

export const zodObjectId = () =>
  z
    .string({
      required_error: 'Id is required',
      invalid_type_error: 'Id must be a string'
    })
    .regex(/^[0-9a-f]{24}$/, 'Id must be a valid ObjectId')

export const TitleSchema = z
  .string({
    required_error: 'Title is required',
    invalid_type_error: 'Title must be a string'
  })
  .min(3, 'Title must be at least 3 characters')

export const AddBoardSchema = z.object({
  title: TitleSchema,
  icon: z.nativeEnum(Icons),
  background: zodEnumFromObjKeys(boardImages)
})

export const EditBoardSchema = AddBoardSchema.partial()

export const BoardParamsSchema = z.object({ boardId: zodObjectId() })

export const UpdateOrderSchema = z.object({
  ids: z.array(zodObjectId(), {
    message: 'Ids must be an array of valid ObjectIds'
  })
})
