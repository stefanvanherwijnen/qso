#!/usr/bin/node --experimental-specifier-resolution=node

import { build, InlineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
// import QuasarPlugin from '../vite-plugin-quasar'
import { QuasarPlugin } from '@stefanvh/quasar-app-vite'
import { resolve } from 'path'

import appPaths from '@stefanvh/quasar-app-vite/lib/app-paths'

const {
  appDir,
  srcDir,
  cliDir
} = appPaths

function buildQuasar (opts?: { ssr?: 'client' | 'server' }) {
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
    default:
      outDir = resolve('dist', 'spa')
      break
  }

  build({
    configFile: false,
    build: {
      minify: false,
      outDir,
      emptyOutDir: true
    },
    ...config
  })
}

buildQuasar({
  ssr: 'client'
})
buildQuasar({
  ssr: 'server'
})
buildQuasar()