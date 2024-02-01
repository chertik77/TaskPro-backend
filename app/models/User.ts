import { Schema, model } from 'mongoose'

import { handleSaveError, runValidateAtUpdate } from './hooks'

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/]+$/
const userTheme = ['light', 'violet', 'dark']

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      match: emailPattern,
      unique: true,
      required: true
    },
    password: {
      type: String,
      match: passwordPattern,
      minlength: 8,
      maxlength: 64,
      required: true
    },
    userTheme: {
      type: String,
      enum: userTheme,
      default: 'light'
    },
    avatarURL: {
      type: String
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
