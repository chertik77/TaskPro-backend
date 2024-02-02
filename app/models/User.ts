import { Schema, model } from 'mongoose'
import isEmail from 'validator/lib/isEmail'
import { handleSaveError, runValidateAtUpdate } from './hooks'

const userTheme = ['light', 'violet', 'dark']

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      validate: (value: string) => {
        if (!isEmail(value)) {
          throw new Error('Email is not valid')
        }
      },
      unique: true,
      required: true
    },
    password: {
      type: String,
      minlength: 8,
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
