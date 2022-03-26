/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  // membuat table collaborations
  pgm.createTable('playlist_songs', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true
    }
  })

  // memberikan constraint foreign key pada kolom note_id dan user_id terhadap notes.id dan users.id
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE')
}

exports.down = (pgm) => {
  // menghapus tabel collaborations
  pgm.dropTable('playlist_songs')
}
