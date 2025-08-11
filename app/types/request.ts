import type { Request } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import type * as z from 'zod'

export type TypedRequest<
  P extends z.ZodType,
  Q extends z.ZodType,
  B extends z.ZodType
> = Request<z.infer<P>, unknown, z.infer<B>, z.infer<Q>>

export type TypedRequestBody<B extends z.ZodType> = Request<
  ParamsDictionary,
  unknown,
  z.infer<B>,
  unknown
>

export type TypedRequestParams<P extends z.ZodType> = Request<
  z.infer<P>,
  unknown,
  unknown,
  unknown
>

export type TypedRequestQuery<Q extends z.ZodType> = Request<
  ParamsDictionary,
  unknown,
  unknown,
  z.infer<Q>
>
