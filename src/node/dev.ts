import { readFileSync } from 'fs'
import { resolve } from 'path'
import express, { Express } from 'express'
import { LogLevel, ViteDevServer } from 'vite'
import { baseConfig, VitePlugins } from '@stefanvh/quasar-app-vite'
import appPaths from '@stefanvh/quasar-app-vite/lib/app-paths'
import chalk from 'chalk'
import parseArgs from 'minimist'
import { Plugin } from 'vite'

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    m: 'mode',
    p: 'plugins'
  },
  string: ['m'],
  default: {
    m: 'csr'
  }
})

const {
  appDir,
  srcDir,
  cliDir
} = appPaths

export async function createServer({
    logLevel,
    mode,
    plugins
  }:
  {
    logLevel?: LogLevel,
    mode?: 'csr' | 'ssr',
    plugins?: Plugin[]
  } = {
    logLevel: 'info',
    mode: 'csr'
  }) {
  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite: ViteDevServer
  vite = await (await import('vite')).createServer({
    configFile: false,
    ...baseConfig({
      cliDir,
      srcDir,
      appDir,
      ssr: mode === 'ssr' ? 'client' : undefined,
      plugins
    }),
    logLevel: logLevel,
    server: {
      middlewareMode:  mode === 'ssr' ? 'ssr' : undefined,
      fs: {
        allow: [
          './',
          resolve(appDir),
        ]
      },
      watch: {
        // During tests we edit the files too fast and sometimes chokidar
        // misses change events, so enforce polling for consistency
        usePolling: true,
        interval: 100
      },
    }
  })
  let app
  if (mode === 'ssr') {
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
        console.log(preloadLinks)
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
  } else {
    app = vite
  }
  return app

}

let app: ViteDevServer | Express
let plugins
if (argv.plugins) {
  plugins = (await import(resolve(appDir, argv.plugins))).default(appPaths)
}
switch (argv.mode) {
  case 'ssr':
    app = await createServer({
      mode: 'ssr',
      plugins
    })
    break;
  default:
    app = await createServer({
      plugins
    })
    break;
}
app.listen(3000)
