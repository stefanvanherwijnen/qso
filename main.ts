import App from 'src/App.vue'
import createRouter from 'src/router'

import { createSSRApp, createApp as createVueApp } from 'vue'
// import Dialog from 'quasar/src/plugins/Dialog.js'
import QuasarPlugin from 'quasar/src/vue-plugin'
import QuasarConf from 'quasarConf'
import * as directives from 'quasar/src/directives'
// import iconSet from 'quasar/icon-set/material-icons'
// import { ApolloClients } from '@vue/apollo-composable'
// import { createApolloClient } from './apollo'
// import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'

// import Screen from 'quasar/src/plugins/Screen.js'
// import Dark from 'quasar/src/plugins/Dark.js'
// import History from 'quasar/src/history.js'
// import Lang from 'quasar/src/lang.js'
// import Body from 'quasar/src/body.js'
// import IconSet from 'quasar/src/icon-set.js'

// const autoInstalledPlugins = [
//   Platform,
//   Body,
//   Dark,
//   Screen,
//   History,
//   Lang,
//   IconSet
// ]

// function installPlugins (pluginOpts, pluginList) {
//   pluginList.forEach(Plugin => {
//     Plugin.install(pluginOpts)
//     Plugin.__installed = true
//   })
// }
// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.

interface ssrContext {
  ssr: boolean
  [key: string]: unknown
}

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


let quasarPlugins = {}
if (quasarConf.framework?.plugins) {
  const quasar = await import('quasar')
  for (let plugin of quasarConf.framework?.plugins) {
    quasarPlugins[plugin] = quasar[plugin]
  }
}


if (quasarConf.extras) {
  for (let asset of quasarConf.extras) {
    await import(`/node_modules/@quasar/extras/${asset}/${asset}.css`)
  }
  // importExtras(quasarConf.extras)
}

const bootFiles = import.meta.glob('./src/boot/*.(js|ts)')
console.log(bootFiles)
export function createApp(ssrContext?: ssrContext) {
  let app
  if (import.meta.env.SSR) {
    app = createSSRApp(App)
  } else {
    app = createVueApp(App)
  }
  const router = createRouter()


  // app.use(Quasar, {}, ssrContext)

  // Apollo
  // let ctx
  // let apolloClients: Record<string, ApolloClient<NormalizedCacheObject>> = {}
  // if (import.meta.env.SSR) {
  //   apolloClients.default = createApolloClient()
  // } else {
  //   console.log(window.__APOLLO_STATE__)
  //   apolloClients.default = createApolloClient(window.__APOLLO_STATE__?.default)
  // }
  // app.provide(ApolloClients, apolloClients)
  
  // installPlugins({}, autoInstalledPlugins)

  app.use(QuasarPlugin, {
    plugins: Object.values(quasarPlugins),
    directives
  }, ssrContext)
  // app.use(Quasar, {
  //   components,
  //   plugins: {
  //     Dialog
  //   },
  //   // iconSet: iconSet
  // }, ssrContext)
  app.use(router)
  return { app, router }
}
