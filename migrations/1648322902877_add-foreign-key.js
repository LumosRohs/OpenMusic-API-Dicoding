/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.addConstraint('songs', 'fk_songs.albumid_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE')

  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE')
}

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.albumid_albums.id')
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id')
}
