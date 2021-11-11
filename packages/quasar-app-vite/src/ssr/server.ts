// @ts-check
import { readFileSync } from 'fs'
import express, { Express } from 'express'
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD
import { ViteDevServer } from 'vite'
import { resolve } from 'path'
import { baseConfig } from '../index'
import { getAppPaths } from '@stefanvh/quasar-app-vite/app-paths'

export async function createServer({
  app,
  appDir,
  subRoute = '',
  production
}: {
  app?: Express,
  appDir?: string,
  subRoute?: string,
  isProd?: boolean,
  production?: {
    index: string,
    manifest: Record<string, any>,
    clientDirectory: string
  }
}) {
  if (!app) {
    app = express()
  }
  const appPaths = await getAppPaths(appDir)

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite: ViteDevServer
  if (!production) {
    vite = await (await import('vite')).createServer({
      ...baseConfig({ ssr: 'client', appPaths }),
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
    app.use(subRoute, vite.middlewares)
  } else {
    app.use(subRoute, (await import('compression')).default())
    const serveStatic = (await import('serve-static')).default(
      resolve(production.clientDirectory), {
        index: false
      })
    app.use(subRoute, serveStatic)
  }
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template
      let render
      const ssrContext = {
        req,
        res
      }
      if (!production) {
        // always read fresh template in dev
        template = readFileSync(new URL('../index.html', import.meta.url)).toString()
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule(new URL('../index.html', import.meta.url).pathname)).render
      } else {
        template = production.index
        render = require('./dist/server/entry-server.js').render
      }

      const [appHtml, preloadLinks] = await render(url, production?.manifest || {}, ssrContext)

      const html = template
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`<!--app-html-->`, appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e: any) {
      vite && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app }
}

if (!isTest) {
  createServer({}).then(({ app }) =>
    app.listen(3000, () => {
      console.log('http://localhost:3000')
    })
  )
}
