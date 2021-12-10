import { readFileSync } from 'fs'
import { LogLevel, ViteDevServer } from 'vite'
import { printHttpServerUrls, log } from '@stefanvh/quasar-app-vite/helpers/logger'
import { baseConfig } from '@stefanvh/quasar-app-vite'
import parseArgs from 'minimist'
import { searchForWorkspaceRoot } from 'vite'
import { Server } from 'net'
import fastify, { FastifyInstance } from 'fastify'
import middie from 'middie'
import { appDir, cliDir } from '../app-urls.js'
const argv = parseArgs(process.argv.slice(2), {
  alias: {
    m: 'mode',
  },
  string: ['m', 'host'],
  default: {
    m: 'csr',
    host: '127.0.0.1'
  }
})

export async function createServer ({
  port,
  logLevel,
  mode,
  host
}:
  {
    port?: number,
    logLevel?: LogLevel,
    mode?: 'csr' | 'ssr',
    host?: string
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
    ssr: mode === 'ssr' ? 'server' : undefined
  }))
  config.logLevel = logLevel
  config.server = {
    port,
    middlewareMode: mode === 'ssr' ? 'ssr' : undefined,
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        cliDir.pathname,
        appDir.pathname,
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

        const [appHtml, preloadLinks] = await render(url, {}, ssrContext)
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
    await app.listen(port || 3000, host || '127.0.0.1')
    server = app.server
  } else {
    server = (await vite.listen()).httpServer as Server
  }
  return { server, vite }

}

let server: Server
let vite: ViteDevServer

switch (argv.mode) {
  case 'ssr':
    ({ server, vite } = await createServer({
      mode: 'ssr',
      host: argv.host
    }))
    break;
  default:
    ({ server, vite } = await createServer({
      host: argv.host
    }))
    break;
}
log('Dev server running at:')
printHttpServerUrls(server, vite.config)
