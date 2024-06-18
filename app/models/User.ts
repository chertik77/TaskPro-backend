import { themes } from '@/constants/themes'
import { Schema, model } from 'mongoose'
import isEmail from 'validator/lib/isEmail'

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
      enum: themes,
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

export const User = model('user', userSchema)
