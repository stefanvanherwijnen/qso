import App from 'src/App.vue'
import createRouter from 'src/router'
import { createSSRApp, createApp as createVueApp } from 'vue'
import { Quasar, Dialog } from 'quasar'
import quasarComponents from 'virtual:quasar-components'
import quasarPlugins from 'virtual:quasar-plugins'
import bootFunctions from 'virtual:quasar-boot'
import 'virtual:quasar-extras'
import * as directives from 'quasar/directives'

const plugins = quasarPlugins
const components = quasarComponents

interface ssrContext {
  ssr: boolean
  provide?: Record<string, unknown>
  [key: string]: unknown
}

export function createApp (ssrContext?: ssrContext) {
  let app
  if (import.meta.env.SSR) {
    app = createSSRApp(App)
  } else {
    app = createVueApp(App)
  }
  const router = createRouter()
  app.use(router)

  app.use(Quasar, {
    plugins,
    components,
    directives
  }, ssrContext)

  if (ssrContext && ssrContext.provide) {
    for (let key in ssrContext.provide) {
      app.provide(key, ssrContext.provide[key])
    }
  }

  for (let fn of bootFunctions) {
    fn({ app })
  }

  return { app, router }
}
