#!/usr/bin/node --experimental-specifier-resolution=node
import { build } from 'vite'
import { resolve } from 'path'
import { baseConfig } from '../index.js'
import parseArgs from 'minimist'
import { appDir } from '../app-urls.js'
import { promises as fs, existsSync } from 'fs'
import { injectSsrContext } from '../../ssr/helpers.js'
import { routesToPaths } from '../helpers/routes.js'

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    m: 'mode',
    // T: 'target',
    // A: 'arch',
    // b: 'bundler',
    // s: 'skip-pkg',
    // i: 'ide',
    // d: 'debug',
    // h: 'help',
    // P: 'publish'
  },
  // boolean: ['h', 'd', 'u', 'i'],
  // string: ['m', 'T', 'P'],
  string: ['base', 'outDir'],
  default: {
    m: 'csr'
  }
})

const prerender = async ({
  outDir,
  templatePath,
  manifestPath,
  entryServerPath
}: {
  outDir: string,
  templatePath: string,
  manifestPath: string,
  entryServerPath: string
}) => {
  let template
  let manifest
  const promises = []
  template = (await fs.readFile(templatePath)).toString()
  manifest = (await fs.readFile(manifestPath))
  let { render, getRoutes } = (await import(entryServerPath))
  const routes = await getRoutes()
  const paths = routesToPaths(routes).filter(i => !i.includes(':') && !i.includes('*'))
  for (let url of paths) {
    const filename = (url.endsWith('/') ? 'index' : url.replace(/^\//g, '')) + '.html'
    console.log(`Generating ${filename}`)
    const ssrContext = {
      req: { headers: {}, url },
      res: {},
    }
    const [appHtml, preloadLinks] = await render(url, manifest, ssrContext)

    let html = template
      .replace(`<!--preload-links-->`, preloadLinks)
      .replace(`<!--app-html-->`, appHtml)

    html = injectSsrContext(html, ssrContext)

    promises.push(fs.writeFile(outDir + filename, html, 'utf-8'))
  }
  return Promise.all(promises)
}

async function buildQuasar (opts: { ssr?: 'client' | 'server' | 'ssg', base?: string, outDir?: string }) {
  let config = await baseConfig({
    ssr: opts?.ssr
  })

  config.build = {
    ...config.build,
    minify: false,
    outDir: opts.outDir,
    emptyOutDir: !!opts.outDir
  }

  return build({
    configFile: false,
    base: opts.base,
    // logLevel: 'silent',
    ...config
  })
}

let baseOutDir: URL
if (argv.outDir) {
  if (argv.outDir.slice(-1) !== '/') argv.outDir + '/'
  baseOutDir = new URL(`file://${argv.outDir}`)
} else {
  baseOutDir = new URL('dist/', appDir)
}


switch (argv.mode) {
  case 'csr':
    await buildQuasar({
      base: argv.base,
      outDir: new URL('spa/', baseOutDir).pathname
    })
    break;
  case 'ssr':
    await buildQuasar({
      ssr: 'client',
      base: argv.base,
      outDir: new URL('ssr/client/', baseOutDir).pathname
    })
    await buildQuasar({
      ssr: 'server',
      base: argv.base,
      outDir: new URL('ssr/server/', baseOutDir).pathname
    })
    break;
  case 'ssg':
    await buildQuasar({
      ssr: 'client',
      base: argv.base,
      outDir: new URL('static/', baseOutDir).pathname
    })
    await buildQuasar({
      ssr: 'server',
      base: argv.base,
      outDir: new URL('ssr/server/', baseOutDir).pathname
    })
    prerender({
      outDir: new URL('static/', baseOutDir).pathname,
      templatePath: new URL('static/index.html', baseOutDir).pathname,
      manifestPath: new URL('static/ssr-manifest.json', baseOutDir).pathname,
      entryServerPath: new URL('ssr/server/entry-server.js', baseOutDir).pathname
    })
    break;
  default:
    console.log('Invalid build mode')
    break;
}
