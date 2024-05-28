import { priorityList } from '@/models/Card'
import Joi from 'joi'

const schema = Joi.object({
  title: Joi.string().min(3),
  description: Joi.string().min(3),
  priority: Joi.string().valid(...priorityList),
  deadline: Joi.date()
})

export const addNewCardSchema = schema.options({ presence: 'required' })

export const editCardSchema = schema
