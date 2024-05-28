import { Schema, model } from 'mongoose'
import { handleSaveError, runValidateAtUpdate } from './hooks'

export const priorityList = ['Low', 'Medium', 'High', 'Without priority']

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
      enum: priorityList,
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

cardSchema.post('save', handleSaveError)

cardSchema.pre('findOneAndUpdate', runValidateAtUpdate)

cardSchema.post('findOneAndUpdate', handleSaveError)

export const Card = model('card', cardSchema)
