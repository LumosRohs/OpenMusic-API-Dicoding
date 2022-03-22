require('dotenv').config()

const Hapi = require('@hapi/hapi')
const albums = require('./api/albums')
const songs = require('./api/songs')
const AlbumService = require('./services/postgres/AlbumService')
const SongService = require('./services/postgres/SongService')
const { AlbumValidator, SongValidator } = require('./validator/albums')
const ClientError = require('./exceptions/ClientError')

const init = async () => {
  const albumsService = new AlbumService()
  const songsService = new SongService()
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register([{
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumValidator
    }
  }, {
    plugin: songs,
    options: {
      service: songsService,
      validator: SongValidator
    }
  }])

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request
    if (response instanceof ClientError) {
      // membuat response baru dari response toolkit sesuai kebutuhan error handling
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      })
      newResponse.code(response.statusCode)
      return newResponse
    }
    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return response.continue || response
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
