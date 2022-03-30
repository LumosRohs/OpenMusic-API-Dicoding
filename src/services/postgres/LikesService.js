const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class LikeService {
  constructor (cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
  }

  async checkAlbumId (albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId]
    }
    const { rows } = await this._pool.query(query)
    if (!rows.length) {
      throw new NotFoundError('Album Id tidak ditemukan')
    }
  }

  async checkAlbumLike (userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    }
    const { rows } = await this._pool.query(query)

    if (!rows.length) {
      return false
    }

    return true
  }

  async addAlbumLike (userId, albumId) {
    const id = `like-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId]
    }
    const { rows } = await this._pool.query(query)

    if (!rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan')
    }

    await this._cacheService.delete(`likes:${albumId}`)
    return rows[0].id
  }

  async getAlbumLikesById (albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`)
      return JSON.parse(result)
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId]
      }
      const { rows } = await this._pool.query(query)

      if (!rows.length) {
        throw new NotFoundError('Album tidak ditemukan')
      }

      await this._cacheService.set(`likes:${albumId}`, parseInt(JSON.stringify(rows[0].count)))

      return parseInt(rows[0].count)
    }
  }

  async deleteAlbumLike (userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId]
    }
    const { rows } = await this._pool.query(query)

    if (!rows.length) {
      throw new NotFoundError('Like gagal dihapus.')
    }

    await this._cacheService.delete(`likes:${albumId}`)
  }
}

module.exports = LikeService
