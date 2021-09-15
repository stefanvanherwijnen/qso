// @ts-check
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import express from 'express'
import { fileURLToPath } from 'url'
import serialize from 'serialize-javascript'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);

export async function createServer() {

  const indexProd = readFileSync(new URL('client/index.html', import.meta.url)).toString()

  const manifest = await import('./client/ssr-manifest.json')

  const app = express()

  app.use((await import('compression')).default())
  app.use((await import('serve-static')).default(
    resolve(__dirname, 'client'), {
      index: false
    })
  )

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template
      let render
      const ssrContext = {
        req,
        res
      }
      template = indexProd
      render = (await import('./server/entry-server.js')).render
      

      const [appHtml, preloadLinks] = await render(url, manifest, ssrContext)

      const html = template
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`<!--app-html-->`, appHtml)
        // .replace('<!--apollo-state-->', apolloState)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app }
}

createServer().then(({ app }) =>
  app.listen(3000, () => {
    console.log('http://localhost:3000')
  })
)
