import cac from 'cac'
import { appDir as defaultAppDir, parsePath } from '../app-urls.js'
import { printHttpServerUrls } from '../helpers/logger.js'
import type { ViteDevServer } from 'vite'
import type { Server } from 'net'

const cli = cac('qso')
cli
  .command('build')
  .option('-m, --mode [mode]', 'Build mode', { default: 'csr' })
  .option('--base [base]', 'Base public path')
  .option('--outDir [outDir]', 'Output directory')
  .option('--appDir [appDir]', 'App directory')
  .option('--publicDir [publicDir]', 'Public directory')
  .option('--productName [productName]', 'Product name')
  .action(async (options) => {
    let { prerender, buildQuasar } = await import('./build.js')
    let appDir: URL
    if (options.appDir) {
      if (options.appDir.slice(-1) !== '/') options.appDir += '/'
      appDir = new URL(`file://${options.appDir}`)
    } else {
      appDir = defaultAppDir
    }

    let baseOutDir = parsePath(options.outDir) || new URL('dist/', appDir)

    const args: {
      base: string,
      appDir?: URL
      publicDir?: URL
    } = {
      base: options.base,
      appDir,
      publicDir: parsePath(options.publicDir)
    }

    switch (options.mode) {
      case 'csr':
        await buildQuasar({
          ...args,
          outDir: new URL('spa/', baseOutDir).pathname
        })
        break;
      case 'ssr':
        await buildQuasar({
          ssr: 'client',
          ...args,
          outDir: new URL('ssr/client/', baseOutDir).pathname
        })
        await buildQuasar({
          ssr: 'server',
          ...args,
          outDir: new URL('ssr/server/', baseOutDir).pathname
        })
        break;
      case 'ssg':
        await buildQuasar({
          ssr: 'client',
          ...args,
          outDir: new URL('static/', baseOutDir).pathname
        })
        await buildQuasar({
          ssr: 'server',
          ...args,
          outDir: new URL('ssr/server/', baseOutDir).pathname
        })
        prerender({
          outDir: new URL('static/', baseOutDir).pathname,
          templatePath: new URL('static/index.html', baseOutDir).pathname,
          manifestPath: new URL('static/ssr-manifest.json', baseOutDir).pathname,
          entryServerPath: new URL('ssr/server/entry-server.mjs', baseOutDir).pathname
        })
        break;
      default:
        console.log('Invalid build mode')
        break;
    }
  })

cli.command('dev')
  .option('-m, --mode [mode]', 'Development server mode', { default: 'csr' })
  .option('--host [host]', 'Specify which IP addresses the server should listen on', { default: '127.0.0.1' })
  .option('--appDir [appDir]', 'Application directory')
  .option('--publicDir [publicDir]', 'Public directory')
  .action(async (options) => {
    let server: Server
    let vite: ViteDevServer
    let { createServer } = await import('./dev.js')
    switch (options.mode) {
      case 'ssr':
        ({ server, vite } = await createServer({
          mode: 'ssr',
          host: options.host,
          appDir: parsePath(options.appDir),
          publicDir: parsePath(options.publicDir)
        }))
        break;
      default:
        ({ server, vite } = await createServer({
          host: options.host,
          appDir: parsePath(options.appDir),
          publicDir: parsePath(options.publicDir)
        }))
        break;
    }
    console.log('Dev server running at:')
    printHttpServerUrls(server, vite.config)
  })

// Default
cli.command('')
  .action((command, options) => {
    cli.outputHelp()
  })

cli.help()

cli.parse()