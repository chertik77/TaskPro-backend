import Joi from 'joi'

export const addNewTaskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().required().min(8),
  priority: Joi.string().valid('Without priority', 'Low', 'Medium', 'High'),
  deadline: Joi.date().required()
})

export const editBoardSchema = Joi.object({
  title: Joi.string().min(3),
  description: Joi.string().min(8),
  priority: Joi.string().valid('Without priority', 'Low', 'Medium', 'High'),
  deadline: Joi.date()
})