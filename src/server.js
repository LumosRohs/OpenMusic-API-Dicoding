require('dotenv').config()

const Hapi = require('@hapi/hapi')
const notes = require('./api/notes')
const AlbumService = require('./services/postgres/AlbumService')
const OpenMusicValidator = require('./validator/openmusic')

const init = async () => {
  const albumsService = new AlbumService()
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register({
    plugin: notes,
    options: {
      service: albumsService,
      validator: OpenMusicValidator
    }
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
