import { Schema, model } from 'mongoose'
import isEmail from 'validator/lib/isEmail'
import { handleSaveError, runValidateAtUpdate } from './hooks'

export const userThemes = ['light', 'dark', 'violet']

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      validate: (value: string) => {
        if (!isEmail(value)) throw new Error('Email is not valid')
      },
      unique: true,
      required: true
    },
    password: {
      type: String,
      minlength: 8,
      required: true
    },
    theme: {
      type: String,
      enum: userThemes,
      default: 'light'
    },
    avatar: {
      url: {
        type: String,
        default:
          'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_light.png'
      },
      publicId: {
        type: String,
        default: ''
      }
    }
  },
  { versionKey: false }
)

userSchema.post('save', handleSaveError)

userSchema.pre('findOneAndUpdate', runValidateAtUpdate)

userSchema.post('findOneAndUpdate', handleSaveError)

const UserModel = model('user', userSchema)

export class User extends UserModel {}
