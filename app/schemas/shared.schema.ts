import * as z from 'zod'

export const objectIdSchema = () =>
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
