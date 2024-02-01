import Joi from 'joi'
import { ObjectId, Schema, model } from 'mongoose'
import { runValidateAtUpdate } from './hooks'

const genreList = ['fantastic', 'love story']
const releaseYearRegexp = /^\d{4}$/

interface User extends Document {
  title: string
  director: string
  favorite?: string
  genre: string
  releaseYear: string
  owner: ObjectId
}

const movieSchema = new Schema<User>(
  {
    title: {
      type: String,
      required: true
    },
    director: {
      type: String,
      required: true
    },
    favorite: {
      type: Boolean,
      default: false
    },
    genre: {
      type: String,
      enum: genreList,
      required: true
    },
    releaseYear: {
      type: String,
      match: releaseYearRegexp,
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { versionKey: false, timestamps: true }
)

// movieSchema.post('save', function (error, _, next) {
//   error.status = 400
//   next()
// })

movieSchema.pre('findOneAndUpdate', runValidateAtUpdate)

// movieSchema.post('findOneAndUpdate', function (error) {
//   handleSaveError
// })

export const movieAddSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': `"title" must be exist`
  }),
  director: Joi.string().required(),
  favorite: Joi.boolean(),
  genre: Joi.string()
    .valid(...genreList)
    .required(),
  releaseYear: Joi.string().pattern(releaseYearRegexp).required()
})

export const movieUpdateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required()
})

export const Movie = model('movie', movieSchema)
