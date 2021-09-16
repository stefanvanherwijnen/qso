#!/usr/bin/node --experimental-specifier-resolution=node

import { build, InlineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
// import QuasarPlugin from '../vite-plugin-quasar'
import { QuasarPlugin } from '@stefanvh/quasar-app-vite'
import { resolve } from 'path'

import appPaths from '@stefanvh/quasar-app-vite/lib/app-paths'

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
  let config: InlineConfig = {
    root: cliDir,
    plugins: [
      vuePlugin(),
      QuasarPlugin({
        ssr: opts?.ssr
      })
    ],
    resolve: {
      alias: [
        { find: 'src', replacement: srcDir },
        { find: 'dist', replacement: resolve('dist') },
        { find: 'quasar', replacement: resolve(appDir, 'node_modules', 'quasar') }
      ]
    }
  }

  let outDir
  switch (opts?.ssr) {
    case 'server':
      outDir = resolve(appDir, 'dist', 'ssr', 'server')
      config = {
        ...config,
        // @ts-ignore
        ssr: {
          noExternal: ['quasar']
        }
      }
      break;
    case 'client':
      outDir = resolve('dist', 'ssr', 'client')
      break;
    case 'ssg':
      outDir = resolve('dist', 'static')
      break;
    default:
      outDir = resolve('dist', 'spa')
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
