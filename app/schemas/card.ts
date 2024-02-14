import Joi from 'joi'

export const addNewCardSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().required().min(3),
  priority: Joi.string().valid('Without priority', 'Low', 'Medium', 'High'),
  deadline: Joi.date().required()
})

export const editCardSchema = Joi.object({
  title: Joi.string().min(3),
  description: Joi.string().min(3),
  priority: Joi.string().valid('Without priority', 'Low', 'Medium', 'High'),
  deadline: Joi.date()
})
