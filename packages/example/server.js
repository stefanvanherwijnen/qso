// @ts-check
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import express from 'express'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);

export async function createServer() {

  const indexProd = readFileSync(new URL('./dist/ssr/client/index.html', import.meta.url)).toString()

  const manifest = readFileSync(new URL('./dist/ssr/client/ssr-manifest.json', import.meta.url)).toString()

  const app = express()

  app.use((await import('compression')).default())
  app.use((await import('serve-static')).default(
    resolve(__dirname, 'dist', 'ssr', 'client'), {
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
      render = (await import('./dist/ssr/server/entry-server.js')).render
      

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
