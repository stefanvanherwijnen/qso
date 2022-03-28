import App from 'src/App.vue'
import createRouter from 'src/router'
import { createSSRApp, createApp as createVueApp, h, onMounted, getCurrentInstance } from 'vue'
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

export async function createApp (ssr?: 'client' | 'server', ssrContext?: ssrContext) {
  let app
  const RootComponent = {
    name: 'AppWrapper',
    setup (props) {
      onMounted(() => {
        const { proxy: { $q } } = getCurrentInstance()
        $q.onSSRHydrated !== void 0 && $q.onSSRHydrated()
      })

      return () => h(App, props)
    }
  }
  if (ssr) {
    app = createSSRApp(RootComponent)
  } else {
    app = createVueApp(RootComponent)
  }
  const router = createRouter()
  app.use(router)

  // Workaround to fix hydration errors when serving html files directly
  router.beforeEach((to, from, next) => {
    if (to.path.endsWith('.html')) {
      next({ path: to.path.replace('.html', '') })
    }

    next()
  })

  app.use(Quasar, {
    plugins: quasarPlugins,
    components: quasarComponents,
    directives
  }, ssrContext)

  let provide: Record<string, unknown> = {}
  if (import.meta.env.SSR && ssrContext?.provide) {
    provide = ssrContext?.provide
  } else {
    // @ts-ignore
    provide = window.__INITIAL_STATE__?.provide
  }
  for (let key in provide) {
    app.provide(key, provide[key])
  }

  for (let fn of Object.values(bootFunctions)) {
    fn({ app })
  }

  return { app, router, routes }
}