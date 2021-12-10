#!/usr/bin/node --experimental-specifier-resolution=node
import { build } from 'vite'
import { resolve } from 'path'
import { baseConfig } from '../index.js'
import parseArgs from 'minimist'
import { appDir } from '../app-urls.js'
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

async function buildQuasar (opts?: { ssr?: 'client' | 'server' | 'ssg', base?: string, outDir?: string }) {
  let config = await baseConfig({
    ssr: opts?.ssr
  })

  let outDir
  let baseOutDir
  if (opts?.outDir) {
    if (opts.outDir.slice(-1) !== '/') opts.outDir + '/'
    baseOutDir = new URL(`file://${opts.outDir}`)
  } else {
    baseOutDir = new URL('dist/', appDir)
  }
  switch (opts?.ssr) {
    case 'server':
      outDir = new URL('ssr/server/', baseOutDir).pathname
      break;
    case 'client':
      outDir = new URL('ssr/client', baseOutDir).pathname
      break;
    case 'ssg':
      outDir = new URL('static/', baseOutDir).pathname
      break;
    default:
      outDir = new URL('spa/', baseOutDir).pathname
      break
  }

  config.build = {
    ...config.build,
    minify: false,
    outDir,
    emptyOutDir: true
  }


  return build({
    configFile: false,
    base: opts?.base,
    // logLevel: 'silent',
    ...config
  })
}

switch (argv.mode) {
  case 'csr':
    await buildQuasar({
      base: argv.base,
      outDir: argv.outDir
    })
    break;
  case 'ssr':
    await buildQuasar({
      ssr: 'client',
      base: argv.base,
      outDir: argv.outDir
    })
    await buildQuasar({
      ssr: 'server',
      base: argv.base,
      outDir: argv.outDir
    })
    break;
  case 'ssg':
    console.log('Prerendering not supported yet')
    await buildQuasar({
      ssr: 'ssg',
      base: argv.base,
      outDir: argv.outDir
    })
    break;
  default:
    console.log('Invalid build mode')
    break;
}
