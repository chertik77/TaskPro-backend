import type { CallbackWithoutResultAndOptionalError, Query } from 'mongoose'
import { CustomError } from '../app'

export const handleSaveError = (
  error: CustomError,
  _: unknown,
  next: CallbackWithoutResultAndOptionalError
) => {
  error.status = 400
  next()
}

export const runValidateAtUpdate = function (
  this: Query<unknown, unknown, object, unknown, 'find'>,
  next: CallbackWithoutResultAndOptionalError
) {
  const options = this.getOptions()
  options.new = true
  options.runValidators = true
  this.setOptions(options)
  next()
}
