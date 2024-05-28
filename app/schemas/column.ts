import Joi from 'joi'

const schema = Joi.object({ title: Joi.string().min(3) })

export const addColumnSchema = schema.options({ presence: 'required' })

export const editColumnSchema = schema
