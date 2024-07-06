import { model, Schema } from 'mongoose'

import { priorities } from 'constants/priorities'

export const cardSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3
    },
    description: {
      type: String,
      required: true,
      minlength: 3
    },
    priority: {
      type: String,
      enum: priorities,
      default: 'Without priority'
    },
    deadline: {
      type: Date,
      required: true
    },
    column: {
      type: Schema.Types.ObjectId,
      ref: 'column',
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

export const Card = model('card', cardSchema)
