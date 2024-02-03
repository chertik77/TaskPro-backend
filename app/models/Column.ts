import { Schema, model } from 'mongoose'
import { handleSaveError, runValidateAtUpdate } from './hooks'

const columnSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    board: {
      type: String,
      ref: 'board',
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { versionKey: false, timestamps: true }
)

columnSchema.post('save', handleSaveError)

columnSchema.pre('findOneAndUpdate', runValidateAtUpdate)

columnSchema.post('findOneAndUpdate', handleSaveError)

export const Column = model('column', columnSchema)
