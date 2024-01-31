import Joi from 'joi'
import isEmail from 'validator/lib/isEmail'

export const signupSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string()
    .required()
    .custom((value, helper) => {
      if (!isEmail(value)) {
        return helper.message({ message: 'email is invalid' })
      }
      return value
    }),
  password: Joi.string().min(8).required()
})

export const signinSchema = Joi.object({
  email: Joi.string()
    .required()
    .custom((value, helper) => {
      if (!isEmail(value)) {
        return helper.message({ message: 'email is invalid' })
      }
      return value
    }),
  password: Joi.string().min(8).required()
})

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
})
