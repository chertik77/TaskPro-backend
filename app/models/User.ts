import { Schema, model } from 'mongoose'

import { handleSaveError, runValidateAtUpdate } from './hooks'

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      match: emailRegexp,
      unique: true,
      required: true
    },
    password: {
      type: String,
      minlength: 6,
      required: true
    },
    token: {
      type: String,
      default: ''
    }
  },
  { versionKey: false, timestamps: true }
)

userSchema.post('save', handleSaveError)

userSchema.pre('findOneAndUpdate', runValidateAtUpdate)

userSchema.post('findOneAndUpdate', handleSaveError)

export const User = model('user', userSchema)
