import type { Plugin, ResolvedConfig } from 'vite'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import Components from 'unplugin-vue-components/vite'
import { resolve } from 'path'
import { generateImportMap } from '@stefanvh/quasar-app-vite/lib/import-map'

const quasarDir = resolve('node_modules', 'quasar')
const importMap = generateImportMap(quasarDir)

/**
 * Proper indentation is required
 */
const additionalDataSass = `@import 'quasar/src/css/helpers/string.sass'
@import 'quasar/src/css/helpers/math.sass'
@import 'quasar/src/css/variables.sass'
@import 'quasar/src/css/normalize.sass'
@import 'quasar/src/components/icon/QIcon.sass'
@import 'quasar/src/css/core/animations.sass'
@import 'quasar/src/css/core/colors.sass'
@import 'quasar/src/css/core/elevation.sass'
@import 'quasar/src/css/core/flex.sass'
@import 'quasar/src/css/core/helpers.sass'
@import 'quasar/src/css/core/mouse.sass'
@import 'quasar/src/css/core/orientation.sass'
@import 'quasar/src/css/core/positioning.sass'
@import 'quasar/src/css/core/size.sass'
@import 'quasar/src/css/core/touch.sass'
@import 'quasar/src/css/core/transitions.sass'
@import 'quasar/src/css/core/typography.sass'
@import 'quasar/src/css/core/visibility.sass'
@import 'quasar/src/css/core/dark.sass'
`

// Should be an argument to the plugin
export interface Configuration {
  pwa?: VitePWAOptions,
  ssr?: 'server' | 'client'
}

export const QuasarPlugin = (configuration?: Configuration): Plugin[] => {
  const extraPlugins: Plugin[] = []
  if (configuration?.pwa) extraPlugins.push(
      ...VitePWA(configuration.pwa)
    )

  return [
    {
      name: 'html-transform',
      enforce: 'pre',
      transformIndexHtml: {
        enforce: 'pre',
        transform: (html) => {
          let entry: string
          switch (configuration?.ssr) {
            case 'server' || 'client':
              entry = './ssr/entry-client.ts'
              break;
            default:
              entry = './spa/entry.ts'
          }
          const entryScript = `<script type="module" src="${entry}"></script>`
          html = html.replace(
            '<!--entry-script-->',
            entryScript
          )
          return html
        }
      }
    },
    Components({
      resolvers: [
        (name: string) => {
          if (name.match(/Q[A-Z][A-z]*/)) {
            if (name in importMap) {
              const sideEffects = importMap[name].sideEffects ? `quasar/${importMap[name].sideEffects}` : undefined
              return {
                path: `quasar/${importMap[name].file}`,
                sideEffects
              }     
            }        
          }
        }
      ]
    }),
    {
      name: 'vite-plugin-quasar',
      enforce: 'pre',
      transform(code, id, ssr) {
        // Required for the ssr argument during ssr builds (combined config for server and client)
        code = code.replace(/__QUASAR_VERSION__/g, `'version'`)
          .replace(/__QUASAR_SSR__/g, (!!ssr).toString())
          .replace(/__QUASAR_SSR_SERVER__/g, (!!ssr).toString())
          .replace(/__QUASAR_SSR_CLIENT__/g, false.toString())
          .replace(/__QUASAR_SSR_PWA__/g, (!!ssr && !!configuration?.pwa).toString())
        return code
      },
      config: (config, env) => {
        return {
          build: {
            ssr: configuration?.ssr === 'server' ? './ssr/entry-server.ts' : false,
            ssrManifest: configuration?.ssr === 'client'
          },
          ssr: {
            noExternal: configuration?.ssr ? ['quasar'] : undefined
          },
          define: {
            __DEV__: process.env.NODE_ENV !== 'production' || true,
            // Does not work
            // __QUASAR_VERSION__: 'version',
            // __QUASAR_SSR__: false,
            // __QUASAR_SSR_SERVER__: false,
            // __QUASAR_SSR_CLIENT__: false,
            // __QUASAR_SSR_PWA__: false
          },
          css: {
            preprocessorOptions: {
              sass: { 
                additionalData: additionalDataSass
              }
            },
          }
        }
      }
    },
    ...extraPlugins
  ]
}

export default QuasarPlugin