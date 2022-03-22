const Joi = require('joi')

const currentYear = new Date().getFullYear()

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().min(1900).max(currentYear).required()
})

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().min(1900).max(currentYear).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().allow(null),
  albumId: Joi.string().allow(null)
})

module.exports = { AlbumPayloadSchema, SongPayloadSchema }
