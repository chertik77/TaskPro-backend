import Joi from 'joi'
import isEmail from 'validator/lib/isEmail'

export const editThemeSchema = Joi.object({
  userTheme: Joi.string().valid('light', 'dark', 'system', 'violet')
})

export const addNewBoardSchema = Joi.object({
  title: Joi.string().min(3).required(),
  icon: Joi.string().required(),
  background: Joi.string().required()
})

export const editBoardSchema = Joi.object({
  title: Joi.string().min(3),
  icon: Joi.string(),
  background: Joi.string()
})

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
