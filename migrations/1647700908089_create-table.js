/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    name: {
      type: 'TEXT',
      notNull: true
    },
    year: {
      type: 'INTEGER',
      notNull: true
    }
  })

  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    title: {
      type: 'TEXT',
      notNull: true
    },
    year: {
      type: 'INTEGER',
      notNull: true
    },
    genre: {
      type: 'TEXT',
      notNull: true
    },
    performer: {
      type: 'TEXT',
      notNull: true
    },
    duration: {
      type: 'INTEGER',
      notNull: false
    },
    albumid: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: '"albums"',
      default: null
    }
  })
}

exports.down = pgm => {
  pgm.dropTable('albums')
  pgm.dropTable('songs')
}
