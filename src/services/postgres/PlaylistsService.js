const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistService {
  constructor (collaborationService) {
    this._pool = new Pool()
    this._collaborationService = collaborationService
  }

  async addPlaylist ({ name, owner }) {
    const id = 'playlist-' + nanoid(16)

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylists (owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id INNER JOIN users ON users.id = playlists.owner WHERE playlists.owner = $1 OR collaborations.user_id = $1',
      values: [owner]
    }
    const result = await this._pool.query(query)

    return result.rows
  }

  async deletePlaylist (id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal dihapus')
    }
  }

  async addSongIntoPlaylist ({ id, songId }) {
    const query = {
      text: 'INSERT INTO playlist_songs (playlist_id, song_id) VALUES($1, $2) RETURNING id',
      values: [id, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan ke dalam Playlist')
    }

    return result.rows[0].id
  }

  async getSongsInPlaylist ({ id }) {
    const query = {
      text: 'SELECT playlists.*, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    const query2 = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
      values: [id]
    }
    const result2 = await this._pool.query(query2)

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    const playlist = result.rows[0]
    const songs = result2.rows

    return {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: songs
    }
  }

  async deleteSongFromPlaylist (id, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [id, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Song gagal dihapus dari Playlist')
    }
  }

  async verifySongId (songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan')
    }
  }

  async verifyPlaylistOwner (id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async checkUserAvaibility (userId) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan')
    }
  }

  async verifyPlaylistAccess (playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }

  async addActivity (playlistId, songId, owner, action) {
    const id = 'activities-' + nanoid(16)
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, owner, action, date]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Activity gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getActivity (id) {
    const query = {
      text: 'SELECT playlist_id FROM playlist_song_activities WHERE playlist_id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    const query2 = {
      text: 'SELECT t2.username, t3.title, t1.action, t1.time FROM playlist_song_activities t1 INNER JOIN users t2 ON t1.user_id = t2.id INNER JOIN songs t3 ON t1.song_id = t3.id WHERE playlist_id = $1',
      values: [id]
    }

    const result2 = await this._pool.query(query2)

    const playlistId = result.rows[0].playlist_id
    const activites = result2.rows

    return {
      playlistId,
      activities: activites
    }
  }
}

module.exports = PlaylistService
