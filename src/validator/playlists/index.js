const { PostPlaylistPayloadSchema, PostSongIntoPlaylistPayloadSchema, DeleteSongFromPlaylistPayloadSchema } = require('./schema')
const InvariantError = require('../../exceptions/InvariantError')

const PlaylistsValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },

  validatePostSongIntoPlaylistPayload: (payload) => {
    const validationResult = PostSongIntoPlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },

  validateDeleteSongFromPlaylistPayload: (payload) => {
    const validationResult = DeleteSongFromPlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = PlaylistsValidator
