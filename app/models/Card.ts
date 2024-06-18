import { priorities } from '@/constants/priorities'
import { Schema, model } from 'mongoose'

export const cardSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
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
