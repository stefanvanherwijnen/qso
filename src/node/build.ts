#!/usr/bin/node --experimental-specifier-resolution=node
import { build } from 'vite'
import { resolve } from 'path'

import appPaths from '@stefanvh/quasar-app-vite/lib/app-paths'
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
  default: {
    m: 'csr'
  }
})

const {
  appDir,
  srcDir,
  cliDir
} = appPaths

async function buildQuasar (opts?: { ssr?: 'client' | 'server' | 'ssg' }) {
  let config = baseConfig({
    cliDir,
    appDir,
    srcDir,
    ssr: opts?.ssr })

  let outDir
  switch (opts?.ssr) {
    case 'server':
      outDir = resolve(appDir, 'dist', 'ssr', 'server')
      break;
    case 'client':
      outDir = resolve(appDir, 'dist', 'ssr', 'client')
      break;
    case 'ssg':
      outDir = resolve(appDir, 'dist', 'static')
      break;
    default:
      outDir = resolve(appDir, 'dist', 'spa')
      break
  }

  return build({
    configFile: false,
    // logLevel: 'silent',
    build: {
      minify: false,
      outDir,
      emptyOutDir: true
    },
    ...config
  })
}

switch (argv.mode) {
  case 'csr':
    await buildQuasar()
    break;
  case 'ssr':
    await buildQuasar({
      ssr: 'client'
    })
    await buildQuasar({
      ssr: 'server'
    })
    break;
  case 'ssg':
    console.log('Prerendering not supported yet')
    await buildQuasar({
      ssr: 'ssg'
    })    
    break;
  default:
    console.log('Invalid build mode')
    break;
}
