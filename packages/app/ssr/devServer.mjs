// @ts-check
import { readFileSync } from 'fs'
import { resolve } from 'path'
import express from 'express'
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

export async function createServer() {
  const app = express()

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite
  vite = await (await import('vite')).createServer({
    configFile: 'ssr/vite.config.ts',
    logLevel: isTest ? 'error' : 'info',
    server: {
      middlewareMode: 'ssr',
      watch: {
        // During tests we edit the files too fast and sometimes chokidar
        // misses change events, so enforce polling for consistency
        usePolling: true,
        interval: 100
      }
    }
  })
  // use vite's connect instance as middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template
      let render
      const ssrContext = {
        req,
        res
      }
      // always read fresh template in dev
      template = readFileSync(new URL('index.html', import.meta.url)).toString()
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/entry-server.js')).render

      const [appHtml, preloadLinks] = await render(url, {}, ssrContext)

      const html = template
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`<!--app-html-->`, appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app, vite }
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(3000, () => {
      console.log('http://localhost:3000')
    })
  )
}
