import Joi from 'joi'

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
