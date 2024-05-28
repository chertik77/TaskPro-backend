import Joi from 'joi'

const schema = Joi.object({
  title: Joi.string().min(3),
  icon: Joi.string(),
  background: Joi.string()
})

export const addNewBoardSchema = schema.options({ presence: 'required' })

export const editBoardSchema = schema
