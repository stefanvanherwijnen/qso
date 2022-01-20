import App from 'src/App.vue'
import createRouter from 'src/router'
import { createSSRApp, createApp as createVueApp, h } from 'vue'
import { Quasar, useQuasar } from 'quasar'
import quasarComponents from 'virtual:quasar-components'
import quasarPlugins from 'virtual:quasar-plugins'
import bootFunctions from 'virtual:quasar-boot'
import 'virtual:quasar-extras'
import * as directives from 'quasar/directives'
import routes from 'src/router/routes'
interface ssrContext {
  ssr: boolean
  provide?: Record<string, unknown>
  [key: string]: unknown
}

export function createApp (ssrContext?: ssrContext) {
  let app
  if (import.meta.env.SSR) {
    app = createSSRApp({
      mounted () {
        const $q = useQuasar()
        $q.onSSRHydrated !== void 0 && $q.onSSRHydrated()
      },
      render: () => h(App)
    })
  } else {
    app = createVueApp({
      mounted () {
        const $q = useQuasar()
        $q.onSSRHydrated !== void 0 && $q.onSSRHydrated()
      },
      render: () => h(App)
    })
  }
  const router = createRouter()
  app.use(router)

  app.use(Quasar, {
    plugins: quasarPlugins,
    components: quasarComponents,
    directives
  }, ssrContext)

  if (ssrContext && ssrContext.provide) {
    for (let key in ssrContext.provide) {
      app.provide(key, ssrContext.provide[key])
    }
  }

  for (let fn of Object.values(bootFunctions)) {
    fn({ app })
  }

  return { app, router, routes }
}
