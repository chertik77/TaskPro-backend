import type { Request } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import type * as z from 'zod'

export type TypedRequestBody<
  B extends z.ZodType<unknown, z.ZodTypeDef, unknown>
> = Request<ParamsDictionary, unknown, z.infer<B>, unknown>

export type TypedRequestParams<
  P extends z.ZodType<unknown, z.ZodTypeDef, unknown>
> = Request<z.infer<P>, unknown, unknown, unknown>

export type TypedRequest<
  B extends z.ZodType<unknown, z.ZodTypeDef, unknown>,
  P extends z.ZodType<unknown, z.ZodTypeDef, unknown>
> = TypedRequestBody<B> & TypedRequestParams<P>
