import App from 'src/App.vue'
import createRouter from 'src/router'

import { createSSRApp, createApp as createVueApp } from 'vue'
import QuasarPlugin from 'quasar/src/vue-plugin'
import { quasarExtensions } from 'virtual:quasar-extensions'
import quasarComponents from 'virtual:quasar-components'
import quasarPlugins from 'virtual:quasar-plugins'
import bootFunctions from 'virtual:quasar-boot'
import 'virtual:quasar-extras'
import * as directives from 'quasar/src/directives'

interface ssrContext {
  ssr: boolean
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

  app.use(QuasarPlugin, {
    plugins: quasarPlugins,
    components: quasarComponents,
    directives
  }, ssrContext)

  app.use(router)

  for (let fn of Object.values(bootFunctions)) {
    fn({ app })
  }

  return { app, router }
}
