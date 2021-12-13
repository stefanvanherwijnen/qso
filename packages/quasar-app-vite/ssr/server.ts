import fastify, { FastifyInstance } from 'fastify'
import { readFileSync } from 'fs'
import fastifyStatic from 'fastify-static'
import { resolve } from 'path'
import sensible from 'fastify-sensible'
import helmet from 'fastify-helmet'
import { setup } from 'virtual:fastify-setup'
export const createApp = ({
  setup
}: {
  setup: (fastify: FastifyInstance) => any
}) => {
  const app = fastify({
    logger: true
  })

  app.register(helmet)
  app.register(sensible)

  setup(app)

  app.register(fastifyStatic, {
    root: resolve('./dist/ssr/client'),
    wildcard: false
  })

  app.get('*', async (req, res) => {
      const url = req.raw.url

      let template
      let render
      let manifest
      const ssrContext = {
        req,
        res
      }
      template = readFileSync(resolve('./dist/ssr/client/index.html')).toString()
      manifest = readFileSync(resolve('./dist/ssr/client/ssr-manifest.json'))
      render = (await import(resolve('./dist/ssr/server/entry-server.js'))).render

      const [appHtml, preloadLinks] = await render(url, manifest, ssrContext)
      const html = template
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`<!--app-html-->`, appHtml)

      res.code(200)
      res.type('text/html')
      res.send(html)      
  })

  return app
}

const app = createApp({
  setup
})

app.listen(process.env.PORT || 3000, process.env.HOST || '127.0.0.1')