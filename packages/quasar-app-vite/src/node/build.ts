#!/usr/bin/node --experimental-specifier-resolution=node
import { build } from 'vite'
import { resolve } from 'path'

import { AppPaths, getAppPaths } from '@stefanvh/quasar-app-vite/app-paths'
import { baseConfig } from '@stefanvh/quasar-app-vite'

import parseArgs from 'minimist'
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
  const appPaths = await getAppPaths()
  const {
    appDir,
  } = appPaths

  let config = await baseConfig({
    appPaths,
    ssr: opts?.ssr
  })

  let outDir
  let baseOutDir = opts?.outDir || resolve(appDir, 'dist')
  switch (opts?.ssr) {
    case 'server':
      outDir = resolve(baseOutDir, 'ssr', 'server')
      break;
    case 'client':
      outDir = resolve(baseOutDir, 'ssr', 'client')
      break;
    case 'ssg':
      outDir = resolve(baseOutDir, 'static')
      break;
    default:
      outDir = resolve(baseOutDir, 'spa')
      break
  }

  config.build = {
    ...config.build,
    target: 'esnext',
    minify: false,
    outDir,
    emptyOutDir: true,
    rollupOptions:{
      output: {
        format: 'es'
      }
    }
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
