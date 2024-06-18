import type { Request, Response } from 'express'

import { ZodSchema } from 'zod'

export const validateBody = (schema: ZodSchema) => {
  const func = (req: Request, _: Response) => {
    const result = schema.safeParse(req.body)
    console.log(result)
  }
  return func
}
