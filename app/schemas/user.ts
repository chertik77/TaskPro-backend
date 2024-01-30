import { object, string } from 'joi'
import isEmail from 'validator/lib/isEmail'

export const signupSchema = object({
  name: string().required(),
  email: string()
    .required()
    .custom((value, helper) => {
      if (!isEmail(value)) {
        return helper.message({ message: 'email is invalid' })
      }
      return value
    }),
  password: string().min(8).required()
})

export const signinSchema = object({
  email: string()
    .required()
    .custom((value, helper) => {
      if (!isEmail(value)) {
        return helper.message({ message: 'email is invalid' })
      }
      return value
    }),
  password: string().min(8).required()
})

export const refreshTokenSchema = object({
  refreshToken: string().required()
})
