import App from 'src/App.vue'
import createRouter from 'src/router'

import { createSSRApp, createApp as createVueApp } from 'vue'
import QuasarPlugin from 'quasar/src/vue-plugin'
import QuasarConf from 'quasarConf'
import * as directives from 'quasar/src/directives'
import { importQuasarExtras } from './quasar-extras'
import boot from 'boot'
import { importQuasarPlugins } from './quasar-plugins'

interface ssrContext {
  ssr: boolean
  [key: string]: unknown
}

// Retrieve Quasar config
let quasarConf
const ctx = {
  prod: import.meta.env.PROD,
  mode: {
    ssr: import.meta.env.SSR
  }
}
if (typeof QuasarConf === "function") {
  quasarConf = QuasarConf(ctx)
} else {
  quasarConf = QuasarConf
}

// Import Quasar plugins
let quasarPlugins = {}
if (quasarConf.framework?.plugins) {
  const pluginsImports = Object.entries(importQuasarPlugins).filter(([key, value]) => quasarConf.framework.plugins.includes(key)).reduce(
    (acc, [key, value]) => {
      const promise = value()
      acc.push(promise)
      return acc
  }, [])
  quasarPlugins = await Promise.all(pluginsImports).then((arr) => arr.map(plugin => plugin.default))
}

// Import @quasar/extras
if (quasarConf.extras) {
  Object.entries(importQuasarExtras).filter(([key, value]) => quasarConf.extras.includes(key)).forEach(([key, value]) => value())
}

// Run boot files
if (quasarConf.boot) {
  quasarConf.boot = quasarConf.boot
    .filter(entry => {
      if (typeof entry === 'object') return import.meta.env.SSR === entry.server
      else if (entry !== '') return true
    })
    .map(entry => {
      if (typeof entry === 'string') return entry
      else if (typeof entry === 'object') return entry.path
    })

  Object.entries(boot).filter(([key]) => quasarConf.boot.includes(key.slice(2).split('.')[0])).forEach(([key, bootImport]) => {
    bootImport().then((module) => {
      if (module.default) module.default()
    })
  })
}

export function createApp(ssrContext?: ssrContext) {
  let app
  if (import.meta.env.SSR) {
    app = createSSRApp(App)
  } else {
    app = createVueApp(App)
  }
  const router = createRouter()

  app.use(QuasarPlugin, {
    plugins: quasarPlugins,
    directives
  }, ssrContext)

  app.use(router)
  return { app, router }
}
