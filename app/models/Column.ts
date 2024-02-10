import { Schema, model } from 'mongoose'
import { taskSchema } from './Task'
import { handleSaveError, runValidateAtUpdate } from './hooks'

export const columnSchema = new Schema(
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
    },
    tasks: [taskSchema]
  },
  { versionKey: false }
)

columnSchema.post('save', handleSaveError)

columnSchema.pre('findOneAndUpdate', runValidateAtUpdate)

columnSchema.post('findOneAndUpdate', handleSaveError)

export const Column = model('column', columnSchema)
