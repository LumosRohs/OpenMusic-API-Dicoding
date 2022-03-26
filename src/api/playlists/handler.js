class PlaylistsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this)
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this)
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this)
    this.postSongIntoPlaylistHandler = this.postSongIntoPlaylistHandler.bind(this)
    this.GetSongInPlaylistHandler = this.GetSongInPlaylistHandler.bind(this)
    this.DeleteSongFromPlaylistHandler = this.DeleteSongFromPlaylistHandler.bind(this)
  }

  async postPlaylistHandler (request, h) {
    this._validator.validatePostPlaylistPayload(request.payload)
    const { name } = request.payload
    const { id: credentialId } = request.auth.credentials

    const playlistId = await this._service.addPlaylist({
      name, owner: credentialId
    })

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId
      }
    })
    response.code(201)
    return response
  }

  async getPlaylistsHandler (request) {
    const { id: credentialId } = request.auth.credentials
    const playlists = await this._service.getPlaylists(credentialId)
    return {
      status: 'success',
      data: {
        playlists
      }
    }
  }

  async deletePlaylistByIdHandler (request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(id, credentialId)
    await this._service.deletePlaylist(id)

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus'
    }
  }

  async postSongIntoPlaylistHandler (request, h) {
    this._validator.validatePostSongIntoPlaylistPayload(request.payload)
    const { id } = request.params
    const { songId } = request.payload
    const { id: credentialId } = request.auth.credentials

    await this._service.verifySongId(songId)
    await this._service.verifyPlaylistOwner(id, credentialId)
    await this._service.addSongIntoPlaylist({
      id, songId
    })

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke dalam Playlist'
    })
    response.code(201)
    return response
  }

  async GetSongInPlaylistHandler (request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(id, credentialId)
    const playlist = await this._service.getSongsInPlaylist({
      id
    })

    return {
      status: 'success',
      data: {
        playlist
      }
    }
  }

  async DeleteSongFromPlaylistHandler (request, h) {
    this._validator.validateDeleteSongFromPlaylistPayload(request.payload)
    const { id } = request.params
    const { songId } = request.payload
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(id, credentialId)
    await this._service.deleteSongFromPlaylist(id, songId)

    return {
      status: 'success',
      message: 'Song berhasil dihapus dari Playlist'
    }
  }
}

module.exports = PlaylistsHandler
