const Joi = require('joi')

const currentYear = new Date().getFullYear()

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().min(1900).max(currentYear).required(),
  coverUrl: Joi.string().allow(null)
})

module.exports = { AlbumPayloadSchema }
