import type { ValidationTargets } from 'hono'

import { zValidator as zv } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'
import * as z from 'zod'

export const zValidator = <
  T extends z.ZodSchema,
  Target extends keyof ValidationTargets
>(
  target: Target,
  schema: T
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        res: c.json({
          status: 400,
          message: 'Validation failed',
          errors: z.flattenError(result.error).fieldErrors
        })
      })
    }
  })
