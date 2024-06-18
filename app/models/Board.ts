import { model, Schema } from 'mongoose'

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

export const Board = model('board', boardSchema)
