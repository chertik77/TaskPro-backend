import { Schema, model } from 'mongoose'
import { handleSaveError, runValidateAtUpdate } from './hooks'

const priorityList = ['Low', 'Medium', 'High', 'Without priority']

export const taskSchema = new Schema(
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
  { versionKey: false }
)

taskSchema.post('save', handleSaveError)

taskSchema.pre('findOneAndUpdate', runValidateAtUpdate)

taskSchema.post('findOneAndUpdate', handleSaveError)

export const Task = model('task', taskSchema)