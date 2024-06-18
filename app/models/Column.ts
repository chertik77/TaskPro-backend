import { Schema, model } from 'mongoose'

export const columnSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: 'board',
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { versionKey: false }
)

export const Column = model('column', columnSchema)
