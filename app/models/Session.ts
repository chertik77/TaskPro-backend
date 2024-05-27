import { handleSaveError } from './hooks'

import { Schema, model } from 'mongoose'

const sessionSchema = new Schema(
  { uid: Schema.Types.ObjectId },
  { versionKey: false }
)

sessionSchema.post('save', handleSaveError)

export const Session = model('session', sessionSchema)
