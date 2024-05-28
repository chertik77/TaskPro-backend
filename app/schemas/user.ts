import { userThemes } from '@/models/User'
import Joi from 'joi'
import isEmail from 'validator/lib/isEmail'

export const signinSchema = Joi.object({
  email: Joi.string()
    .required()
    .custom((value, helper) => {
      if (!isEmail(value)) {
        return helper.message({ custom: 'email is invalid' })
      }
      return value
    }),
  password: Joi.string().min(8).required().max(64)
})

export const signupSchema = signinSchema.append({
  name: Joi.string().required().min(2)
})

export const editUserSchema = signupSchema.options({ presence: 'optional' })

export const needHelpSchema = Joi.object({
  email: Joi.string()
    .custom((value, helper) => {
      if (!isEmail(value)) {
        return helper.message({ custom: 'email is invalid' })
      }
      return value
    })
    .required(),
  comment: Joi.string().min(5).required()
})

export const changeThemeSchema = Joi.object({
  theme: Joi.string().valid(...userThemes)
})

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
})
