import * as z from 'zod'

export const AddBoardSchema = z.object({
  title: z.string().min(3),
  icon: z.string(),
  background: z.string()
})

export const EditBoardSchema = AddBoardSchema.partial()
