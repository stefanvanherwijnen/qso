import type { Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import Components from 'unplugin-vue-components/vite'
import { prepareQuasarConf } from './quasar-conf-file.js'
import { FastifyInstance } from 'fastify'
import { appDir, cliDir, quasarDir } from './app-urls.js'
import { QuasarConf } from './quasar-conf-file.js'

import { generateImportMap } from './import-map.js'
const importMap = generateImportMap(quasarDir.pathname)
const quasarImports = importMap.autoImport.pascalComponents as string[] // Broken type

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
  quasarConf?: Partial<QuasarConf> | ((ctx: Record<string, any>) => Partial<QuasarConf>),
  quasarExtensionIndexScripts?: ((api: any) => void)[]
}

export const QuasarPlugin = ({
  ssr = false,
  quasarConf,
  quasarExtensionIndexScripts,
}: Configuration = {}): Plugin[] => {
  const extraPlugins: Plugin[] = []
  const ctx = {
    prod: process.env.MODE === 'production',
    dev: process.env.MODE === 'development',
    mode: {
      ssr: !!ssr
    }
  }
  let parsedQuasarConf: QuasarConf
  if (quasarConf) {
    if (typeof quasarConf === 'function') {
      quasarConf = quasarConf(ctx)
    }
    parsedQuasarConf = prepareQuasarConf(quasarConf)
  } else {
    parsedQuasarConf = prepareQuasarConf()
  }
  let isPwa = false

  let bootFilePaths: Record<string, any> = {}
  let fastifySetup = (fastify: FastifyInstance) => {}

  const indexApi = {
    ctx,
    getPersistentConf () {},
    setPersistentConf (cfg: Record<string, any>) {},
    mergePersistentConf (cfg = {}) {},
    async compatibleWith (packageName: string, semverCondition: string) {},
    async hasPackage (packageName: string, semverCondition: string) {},
    hasExtension (extId: string) {},
    async getPackageVersion (packageName: string) {},
    extendQuasarConf (fn: (cfg: Record<string, any>, ctx: Record<string, any>) => void) {
      fn(parsedQuasarConf as Record<string, any>, ctx)
    },
    registerCommand (commandName: string, fn: ({ args, params }: { args: string[], params: Record<string, any> }) => Promise<any>) {},
    registerDescribeApi (name: string, relativePath: string) {},
    beforeDev (fn: (api: any, { quasarConf }: { quasarConf: Record<string, any> }) => Promise<any>) {},
    afterDev (fn: (api: any, { quasarConf }: { quasarConf: Record<string, any> }) => Promise<any>) {},
    beforeBuild (fn: (api: any, { quasarConf }: { quasarConf: Record<string, any> }) => Promise<any>) {},
    afterBuild (fn: (api: any, { quasarConf }: { quasarConf: Record<string, any> }) => Promise<any>) {},
  
  }

  if (quasarExtensionIndexScripts) {
    for (let index of quasarExtensionIndexScripts) {
      index(indexApi)
    } 
  }

  if (parsedQuasarConf?.pwa) {
    isPwa = true
    extraPlugins.push(
      ...VitePWA(parsedQuasarConf.pwa)
    )
  }

  if (parsedQuasarConf?.fastify?.setup) {
    fastifySetup = parsedQuasarConf.fastify.setup
  }

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
            path: `${entry.substring(1)}`
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

  if (parsedQuasarConf?.framework.components) {
    parsedQuasarConf.framework.components = [...new Set(parsedQuasarConf.framework.components)];
  }
  if (parsedQuasarConf?.framework.plugins) {
    parsedQuasarConf.framework.plugins = [...new Set(parsedQuasarConf.framework.plugins)];
  }

  const components = parsedQuasarConf?.framework.components
  const plugins = parsedQuasarConf?.framework.plugins
  const css = parsedQuasarConf?.css.map((v => {
        if (v[0] === '~') {
          return v.slice(1)
        }
        return v
       })).map((v) => `@import '${v}'`)
  const extras = parsedQuasarConf?.extras

  return [
    Components({
      resolvers: [
        (name: string) => {
          if (name.match(/Q[A-Z][A-z]*/)) {
            if (quasarImports?.includes(name)) {
              return {
                importName: name,
                path: `quasar`,
              }
            }
          }
        }
      ]
    }),
    {
      name: 'vite-plugin-quasar',
      enforce: 'pre',
      config: (config, env) => {
        return {
          resolve: {
            alias: [
              { find: 'quasar/wrappers', replacement: new URL('quasar-wrappers.ts', cliDir ).pathname },
              { find: 'quasar/vue-plugin', replacement: new URL('src/vue-plugin.js', quasarDir).pathname },
              { find: 'quasar/directives', replacement: new URL('src/directives.js', quasarDir).pathname },
              { find: 'quasar/src', replacement: new URL('src/', quasarDir).pathname },
              { find: new RegExp('^quasar$'), replacement: new URL('node_modules/quasar/src/index.all.js', appDir).pathname },
            ]
          },
          define: {
            __DEV__: process.env.NODE_ENV !== 'production' || true,
            __QUASAR_VERSION__: `'version'`,
            __QUASAR_SSR__: !!ssr,
            __QUASAR_SSR_SERVER__: ssr === 'server',
            __QUASAR_SSR_CLIENT__: ssr === 'client',
            __QUASAR_SSR_PWA__: !!ssr && isPwa
          },
          css: {
            preprocessorOptions: {
              sass: {
                additionalData: [
                  `@import 'quasar/src/css/index.sass'`,
                  ...css
                ].join('\n') + '\n'
              }
            },
          }
        }
      }
    },
    {
      name: 'quasar-virtual-modules',
      enforce: 'pre',
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
        if (id === 'virtual:quasar-conf') {
          return `export const quasarConf = ${JSON.stringify(quasarConf || {})}`
        }
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