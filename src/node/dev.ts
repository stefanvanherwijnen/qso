import { readFileSync } from 'fs'
import { resolve } from 'path'
import express, { Express } from 'express'
import { LogLevel, ViteDevServer } from 'vite'
import { printHttpServerUrls, log } from '@stefanvh/quasar-app-vite/lib/helpers/logger'
import { baseConfig, VitePlugins } from '@stefanvh/quasar-app-vite'
import { AppPaths, getAppPaths } from '@stefanvh/quasar-app-vite/lib/app-paths'
import parseArgs from 'minimist'
import { Plugin } from 'vite'
import { Server } from 'net'

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    m: 'mode',
    p: 'plugins',
    h: 'host'
  },
  string: ['m', 'host'],
  default: {
    m: 'csr',
    h: false
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
    host?: boolean
  } = {
    port: 3000,
    logLevel: 'info',
    mode: 'csr'
  }) {
  const {
    appDir,
    srcDir,
    cliDir
  } = await getAppPaths()
  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite: ViteDevServer
  vite = await (await import('vite')).createServer({
    configFile: false,
    ...(await baseConfig({
      cliDir,
      srcDir,
      appDir,
      ssr: mode === 'ssr' ? 'client' : undefined
    })),
    logLevel,
    server: {
      port,
      middlewareMode: mode === 'ssr' ? 'ssr' : undefined,
      fs: {
        allow: [
          resolve(cliDir),
          resolve(appDir),
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
  })
  let app: ViteDevServer | Express
  let server: Server
  if (mode === 'ssr') {
    console.log('SSR mode')
    app = express()
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
        // template = readFileSync(resolve('index.html'), 'utf-8')
        template = readFileSync(resolve(cliDir, 'index.html')).toString()

        // template = await vite.transformIndexHtml(url, template)
        const entryUrl = resolve(cliDir, 'ssr', 'entry-server.ts')
        render = (await vite.ssrLoadModule(entryUrl)).render

        const [appHtml, preloadLinks] = await render(url, {}, ssrContext)
        const html = template
          .replace(`<!--preload-links-->`, preloadLinks)
          .replace(`<!--app-html-->`, appHtml)

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
      } catch (e) {
        vite && vite.ssrFixStacktrace(e as Error)
        console.log((e as Error).stack)
        res.status(500).end((e as Error).stack)
      }
    })
    server = await app.listen()
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
