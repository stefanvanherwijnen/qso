import { readFileSync } from 'fs';
import type { Plugin } from 'vite'
import Components from 'unplugin-vue-components/vite'
import { prepareQuasarConf } from './quasar-conf-file.js'
import { FastifyInstance } from 'fastify'
import { QuasarConf } from './quasar-conf-file.js'
import { quasarDir as defaultQuasarDir } from './app-urls.js'
import { QuasarResolver } from './resolver.js';
const importExportLiteral = (imports: string[] = [], exports: string[] = []) => `${imports.join('\n')}

export default {
  ${exports.join(',\n')}
}
`

function lowerCamelCase (name: string) {
  return name.replace(/-([a-z])/g, g => g[1].toUpperCase())
}

export interface Configuration {
  ssr?: 'server' | 'client' | 'ssg' | false,
  quasarDir?: URL
}

export const QuasarPlugin = async ({
  ssr = false,
  quasarDir = defaultQuasarDir
}: Configuration = {}): Promise<Plugin[]> => {
  const extraPlugins: Plugin[] = []
  const ctx = {
    prod: process.env.MODE === 'production',
    dev: process.env.MODE === 'development',
    mode: {
      ssr: !!ssr
    }
  }

  let bootFilePaths: Record<string, any> = {}
  let fastifySetup = (fastify: FastifyInstance) => { }
  let components: string[] = []
  let plugins: string[] = []
  let css: string[] = []
  let extras: string[] = []
  let productName: string
  return [
    {
      name: 'legacy-support',
      enforce: 'pre',
      transform (code, id) {
        /**
         * ESM does not resolve an import to .default when there are multiple exports. The following is required to make the VuePlugin import of QCalendar work.
         */
        if (code.includes('app.use(VuePlugin)')) {
          code = code.replace(/app\.use\(VuePlugin\)/g, `app.use(VuePlugin.install ? VuePlugin : VuePlugin.default)`)
        }
        return code
      }
    },
    Components({
      resolvers: [
        QuasarResolver(quasarDir)
      ]
    }),
    {
      name: 'vite-plugin-quasar',
      enforce: 'post',
      transformIndexHtml: {
        enforce: 'post',
        transform: (html) => {
          return html.replace(
            '<!--product-name-->',
            productName
          )
        }
      },
      config: async (config, env) => {
        let appDir: URL
        let cliDir: URL
        let cwd: URL
        let quasarDir: URL
        let quasarConf: Partial<QuasarConf> | ((ctx: Record<string, any>) => Partial<QuasarConf>)
        // @ts-ignore
        ({ appDir, cliDir, cwd, conf: quasarConf, quasarDir, productName } = { ...(await import('./app-urls.js')), ...config?.quasar })

        const quasarPkgJsonPath = new URL('package.json', quasarDir).pathname
        const { version } = JSON.parse(readFileSync(quasarPkgJsonPath, { encoding: 'utf-8' }))

        let parsedQuasarConf
        if (quasarConf) {
          if (typeof quasarConf === 'function') {
            quasarConf = quasarConf(ctx)
          }
          parsedQuasarConf = prepareQuasarConf(quasarConf)
        } else {
          parsedQuasarConf = prepareQuasarConf()
        }

        // @ts-ignore
        if (config.quasar.fastify?.setup) {
          // @ts-ignore
          fastifySetup = config.quasar.fastify.setup
        }

        let isPwa = false
        if (parsedQuasarConf.pwa) isPwa = true

        if (parsedQuasarConf?.boot) {
          bootFilePaths = (parsedQuasarConf.boot as (Record<string, any> | string)[])
            .filter(entry => {
              if (typeof entry === 'object') return (entry.server && (ssr === 'server'))
              else if (entry !== '') return true
            })
            .map(entry => {
              if (typeof entry === 'string') return entry
              else if (typeof entry === 'object') return entry.path
            })
            .reduce((acc, entry) => {
              if (entry[0] === '~') {
                const split = entry.substring(1).split('/')
                const name = split[0].replace(/[|&;$%@"<>()+,]/g, "");
                acc[name] = {
                  path: new URL(`node_modules/${entry.substring(1)}`, appDir).pathname
                }
              } else {
                const name = entry.split('.')[0]
                acc[name] = {
                  path: `src/boot/${entry}`
                }
              }
              return acc
            }, {})
        }

        /**
         * All components should have been auto-imported
         */
        // if (parsedQuasarConf?.framework.components) {
        //   parsedQuasarConf.framework.components = [...new Set(parsedQuasarConf.framework.components)];
        //   components = parsedQuasarConf?.framework.components
        // }
        if (parsedQuasarConf?.framework.plugins) {
          parsedQuasarConf.framework.plugins = [...new Set(parsedQuasarConf.framework.plugins)];
          plugins = parsedQuasarConf?.framework.plugins
        }

        css = parsedQuasarConf?.css.map((v => {
          if (v[0] === '~') {
            return v.slice(1)
          }
          return v
        })).map((v) => `@import '${v}'`)
        extras = parsedQuasarConf?.extras

        // @ts-ignore
        let sassVariables = config.quasar.sassVariables
        if (sassVariables) {
          for (let variable in sassVariables) {
            css.push(`${variable}: ${sassVariables[variable]}`)
          }
        }

        return {
          resolve: {
            alias: [
              { find: 'quasar/wrappers', replacement: new URL('quasar-wrappers.ts', cliDir).pathname },
              { find: 'quasar/vue-plugin', replacement: new URL('src/vue-plugin.js', quasarDir).pathname },
              { find: 'quasar/directives', replacement: new URL('src/directives.js', quasarDir).pathname },
              { find: 'quasar/src', replacement: new URL('src/', quasarDir).pathname },
              { find: new RegExp('^quasar$'), replacement: new URL('src/index.all.js', quasarDir).pathname },
            ]
          },
          define: {
            __DEV__: process.env.NODE_ENV !== 'production' || true,
            __QUASAR_VERSION__: `'${version}'`,
            __QUASAR_SSR__: !!ssr,
            __QUASAR_SSR_SERVER__: ssr === 'server',
            __QUASAR_SSR_CLIENT__: ssr === 'client',
            __QUASAR_SSR_PWA__: (ssr === 'client') && isPwa
          },
          css: {
            preprocessorOptions: {
              sass: {
                additionalData: [
                  ...css,
                  `@import 'quasar/src/css/index.sass'`
                ].join('\n') + '\n'
              }
            },
          }
        }
      }
    },
    {
      name: 'quasar-virtual-modules',
      enforce: 'post',
      resolveId (id) {
        switch (id) {
          case 'virtual:quasar-conf':
            return 'virtual:quasar-conf'
          case 'virtual:quasar-plugins':
            return 'virtual:quasar-plugins'
          case 'virtual:quasar-components':
            return 'virtual:quasar-components'
          case 'virtual:quasar-extras':
            return 'virtual:quasar-extras'
          case 'virtual:quasar-boot':
            return 'virtual:quasar-boot'
          case 'virtual:fastify-setup':
            return 'virtual:fastify-setup'
          default:
            return;
        }
      },
      load (id) {
        if (id === 'virtual:quasar-plugins') {
          const imports = plugins?.map((plugin: string) => `import { ${plugin} } from 'quasar'`)
          return importExportLiteral(imports, plugins)
        }
        if (id === 'virtual:quasar-components') {
          const imports = components?.map((component: string) => `import { ${component} } from 'quasar'`)
          return {
            code: importExportLiteral(imports, components),
            moduleSideEffects: 'no-treeshake'
          }
        }
        if (id === 'virtual:quasar-extras') {
          const imports = extras?.map((extra: string) => `import ${lowerCamelCase(extra)} from '@quasar/extras/${extra}/${extra}.css'`)
          return importExportLiteral(imports, extras?.map((extra: string) => lowerCamelCase(extra)))
        }
        if (id === 'virtual:quasar-boot') {
          const bootFiles = Object.keys(bootFilePaths)
          const imports = bootFiles?.map((boot: string) => `import ${lowerCamelCase(boot)} from '${bootFilePaths[boot].path}'`)
          return importExportLiteral(imports, bootFiles?.map((boot: string) => lowerCamelCase(boot)))
        }
        if (id === 'virtual:fastify-setup') {
          return `export const setup = ${String(fastifySetup)}`
        }
        return null
      }
    },
    ...extraPlugins
  ]
}

export default QuasarPlugin