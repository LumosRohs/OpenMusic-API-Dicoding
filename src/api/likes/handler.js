class LikesHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this)
    this.getAlbumLikesByIdHandler = this.getAlbumLikesByIdHandler.bind(this)
  }

  async postAlbumLikeHandler (request, h) {
    let result
    const { albumId } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.checkAlbumId(albumId)

    const liked = await this._service.checkAlbumLike(credentialId, albumId)

    if (liked === false) {
      await this._service.addAlbumLike(credentialId, albumId)
      result = 'Like berhasil ditambahkan'
    } else {
      await this._service.deleteAlbumLike(credentialId, albumId)
      result = 'Like berhasil dibatalkan'
    }

    const response = h.response({
      status: 'success',
      message: result
    })
    response.code(201)
    return response
  }

  async getAlbumLikesByIdHandler (request, h) {
    const { albumId } = request.params
    const likes = await this._service.getAlbumLikesById(albumId)
    return {
      status: 'success',
      data: {
        likes
      }
    }
  }
}

module.exports = LikesHandler
