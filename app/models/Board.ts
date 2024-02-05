import { Schema, model } from 'mongoose'
import { columnSchema } from './Column'
import { handleSaveError, runValidateAtUpdate } from './hooks'

const boardSchema = new Schema(
  {
    title: {
      type: String,
      unique: true,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    background: {
      type: String,
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    columns: [columnSchema]
  },
  { versionKey: false, timestamps: true }
)

boardSchema.post('save', handleSaveError)

boardSchema.pre('findOneAndUpdate', runValidateAtUpdate)

boardSchema.post('findOneAndUpdate', handleSaveError)

export const Board = model('board', boardSchema)
