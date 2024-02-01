import Joi from 'joi'

export const addColumnSchema = Joi.object({
  title: Joi.string().min(3).required()
})

export const editColumnSchema = Joi.object({ title: Joi.string().min(3) })
