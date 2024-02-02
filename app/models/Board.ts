import { Schema, model } from 'mongoose'
import { handleSaveError, runValidateAtUpdate } from './hooks'

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
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { versionKey: false, timestamps: true }
)

boardSchema.post('save', handleSaveError)

boardSchema.pre('findOneAndUpdate', runValidateAtUpdate)

boardSchema.post('findOneAndUpdate', handleSaveError)

export const Board = model('board', boardSchema)
