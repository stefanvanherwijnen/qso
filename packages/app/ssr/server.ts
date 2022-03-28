import fastify, { FastifyInstance } from 'fastify'
import { setup } from 'virtual:fastify-setup'
import { fastifySsrPlugin } from './fastify-ssr-plugin.js'

const interpolate = (str?: string) => str

export const createApp = ({
  setup
}: {
  setup: (fastify: FastifyInstance) => any
}) => {
  const app = fastify({
    logger: true
  })

  let baseUrl = interpolate(__BASE_URL__)
  app.register(fastifySsrPlugin, {
    baseUrl
  })

  setup(app)

  return app
}

const app = createApp({
  setup
})

app.listen(process.env.PORT || 3000, process.env.HOST || '127.0.0.1')