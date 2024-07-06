import { model, Schema } from 'mongoose'

const boardSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 3
    },
    icon: {
      type: String,
      required: true
    },
    background: {
      url: String,
      identifier: String,
      hasWhiteTextColor: Boolean
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
