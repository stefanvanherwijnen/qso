import type { ViteDevServer, LogLevel } from 'vite'
import { searchForWorkspaceRoot } from 'vite'
import { cliDir } from '../app-urls.js'
import { baseConfig } from '../index.js'
import type { Server } from 'net'
import type { FastifyInstance } from 'fastify/types/instance'
import fastify from 'fastify'
import middie from 'middie'
import { readFileSync } from 'fs'

export async function createServer ({
  port,
  logLevel,
  mode,
  host,
  appDir,
  publicDir
}:
  {
    port?: number,
    logLevel?: LogLevel,
    mode?: 'csr' | 'ssr',
    host?: string,
    appDir?: URL,
    publicDir?: URL
  } = {
    port: 3000,
    logLevel: 'info',
    mode: 'csr'
  }) {

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite: ViteDevServer
  const config = (await baseConfig({
    ssr: mode === 'ssr' ? 'server' : undefined,
    appDir,
    publicDir
  }))
  config.logLevel = logLevel
  config.server = {
    port,
    middlewareMode: mode === 'ssr' ? 'ssr' : undefined,
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        searchForWorkspaceRoot(cliDir.pathname)
        // appDir.pathname,
      ]
    },
    watch: {
      // During tests we edit the files too fast and sometimes chokidar
      // misses change events, so enforce polling for consistency
      usePolling: true,
      interval: 100
    },
    host
  }
  vite = await (await import('vite')).createServer({
    configFile: false,
    ...config
  })
  let app: ViteDevServer | FastifyInstance
  let server: Server
  if (mode === 'ssr') {
    console.log('SSR mode')
    // app = express()
    app = fastify()
    await app.register(middie)
    app.use(vite.middlewares)

    app.get('*', async (req, res) => {
      try {
        // const url = req.originalUrl
        const url = req.raw.url
        let template
        let render
        const ssrContext = {
          req,
          res
        }
        // always read fresh template in dev
        // template = readFileSync(resolve('index.html'), 'utf-8')
        template = readFileSync(new URL('index.html', cliDir)).toString()

        // template = await vite.transformIndexHtml(url, template)
        const entryUrl = new URL('ssr/entry-server.ts', cliDir).pathname
        render = (await vite.ssrLoadModule(entryUrl)).render
        let manifest
        // TODO: https://github.com/vitejs/vite/issues/2282
        try {
          manifest = {}
        } catch (e) {
          manifest = {}
        }

        const [appHtml, preloadLinks] = await render(url, manifest, ssrContext)
        const html = template
          .replace(`<!--preload-links-->`, preloadLinks)
          .replace(`<!--app-html-->`, appHtml)

        res.code(200)
        res.type('text/html')
        res.send(html)
        // res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
      } catch (e: any) {
        console.error(e.stack)
        vite && vite.ssrFixStacktrace(e)
        res.code(500)
        res.send(e.stack)
      }
    })
    await app.listen(port || 3000, host === '' ? '0.0.0.0' : '127.0.0.1')
    server = app.server
  } else {
    server = (await vite.listen()).httpServer as Server
  }
  return { server, vite }

}