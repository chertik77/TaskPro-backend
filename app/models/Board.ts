import Joi from 'joi'
import { Schema, model } from 'mongoose'

// import { handleSaveError, runValidateAtUpdate } from './hooks'

const priorityList = ['Low', 'Medium', 'High', 'Without priority']

const taskSchema = new Schema({
  title: String,
  description: String,
  priority: {
    type: String,
    enum: priorityList,
    default: 'Without priority'
  },
  deadline: Date,
  column: {
    type: Schema.Types.ObjectId,
    ref: 'сolumn',
    required: true
  }
})

const columnSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  tasks: [taskSchema]
})

const boardSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    iconName: {
      type: String,
      required: true
    },
    backgroundImage: {
      cloudinaryId: {
        type: String,
        required: true
      },
      default: null
    },
    columns: [columnSchema],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { versionKey: false, timestamps: true }
)

// movieSchema.post('save', handleSaveError)

// movieSchema.pre('findOneAndUpdate', runValidateAtUpdate)

// movieSchema.post('findOneAndUpdate', handleSaveError)

//додати Joi схеми

export const Board = model('board', boardSchema)
