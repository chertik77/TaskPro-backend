import { Schema, model } from 'mongoose'
import { handleSaveError, runValidateAtUpdate } from './hooks'

const boardSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    background: {
      type: Object
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { versionKey: false }
)

boardSchema.post('save', handleSaveError)

boardSchema.pre('findOneAndUpdate', runValidateAtUpdate)

boardSchema.post('findOneAndUpdate', handleSaveError)

export const Board = model('board', boardSchema)
