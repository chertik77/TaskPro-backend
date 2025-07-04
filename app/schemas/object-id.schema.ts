import * as z from 'zod'

export const objectIdSchema = () =>
  z.string().regex(/^[0-9a-f]{24}$/, 'Id must be a valid ObjectId')
