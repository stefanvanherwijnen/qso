import type { Plugin, ResolvedConfig } from 'vite'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import Components from 'unplugin-vue-components/vite'
import { resolve } from 'path'
import { generateImportMap, parseAutoImport } from '@stefanvh/quasar-app-vite/import-map'
import { AppPaths, getAppPaths } from '@stefanvh/quasar-app-vite/app-paths'
import { existsSync } from 'fs'
import { join, sep, normalize } from 'path'
import { fatal } from '@stefanvh/quasar-app-vite/helpers/logger'
// function getQuasarDir () {
//   let dir = process.cwd()

//   while (dir.length && dir[dir.length - 1] !== sep) {
//     if (existsSync(join(dir, 'node_modules', 'quasar'))) {
//       return join(dir, 'node_modules', 'quasar')
//     }

//     dir = normalize(join(dir, '..'))
//   }
// }
// export const quasarDir = getQuasarDir()
// if (!quasarDir) fatal('Quasar directory not found')
import IndexAPI from '@stefanvh/quasar-app-vite/app-extension/IndexAPI'
import Extension from '@stefanvh/quasar-app-vite/app-extension/Extension'
import { QuasarConf } from '@stefanvh/quasar-app-vite/quasar-conf-file'
import fastify, { FastifyInstance } from 'fastify'

const importExportLiteral = (imports: string[] = [], exports: string[] = []) => `${imports.join('\n')}

export default {
  ${exports.join(',\n')}
}
`

function lowerCamelCase (name: string) {
  return name.replace(/-([a-z])/g, g => g[1].toUpperCase())
}


// Should be an argument to the plugin
export interface Configuration {
  appPaths?: AppPaths,
  ssr?: 'server' | 'client' | 'ssg' | false,
  injectEntry?: boolean,
  loadQuasarConf?: boolean,
  loadQuasarExtensions?: boolean
}

export const QuasarPlugin = async ({
  appPaths,
  ssr = false,
  injectEntry = true,
  loadQuasarConf = false,
  loadQuasarExtensions = false
}: Configuration = {}): Promise<Plugin[]> => {
  const extraPlugins: Plugin[] = []
  // if (configuration?.pwa) extraPlugins.push(
  //   ...VitePWA(configuration.pwa)
  // )
  if (!appPaths) {
    appPaths = await getAppPaths()
  }
  const { appDir, srcDir, cliDir } = appPaths
  const quasarDir = resolve(appDir, 'node_modules', 'quasar')
  let isPwa = false

  const { map: importMap, autoImport } = generateImportMap(quasarDir!)

  const imported: string[] = []

  const additionalDataSass = ({
      components = [],
      plugins = [],
      css = [],
      sassVariables
    }: {
      components: string[],
      plugins: string[],
      css: string[],
      sassVariables?: string | false
    }) => {
    css = css?.map((v => {
      if (v[0] === '~') {
        return v.slice(1)
      }
      return v
    }))
  
    const componentsCss = components
      ?.filter((component) => importMap[component].sideEffects?.length)
      .map((component) => importMap[component].sideEffects?.map((s) => `@import 'quasar/${s}'`))
  
    const pluginsCss = plugins
      ?.filter((plugin) => importMap[plugin].sideEffects?.length)
      .map((plugin) => importMap[plugin].sideEffects?.map((s) => `@import 'quasar/${s}'`))
  
    imported.push(...components)
    imported.push(...plugins)
  
    const additinalData = []
    if (sassVariables) {
      additinalData.push(`@import ${sassVariables}`)
    }
      additinalData.push(
        `@import 'quasar/src/css/variables.sass'`,
        `@import 'quasar/src/css/helpers/string.sass'`,
        `@import 'quasar/src/css/helpers/math.sass'`,
        `@import 'quasar/src/css/normalize.sass'`,
        `@import 'quasar/src/css/core/animations.sass'`,
        `@import 'quasar/src/css/core/colors.sass'`,
        `@import 'quasar/src/css/core/elevation.sass'`,
        `@import 'quasar/src/css/core/flex.sass'`,
        `@import 'quasar/src/css/core/helpers.sass'`,
        `@import 'quasar/src/css/core/mouse.sass'`,
        `@import 'quasar/src/css/core/orientation.sass'`,
        `@import 'quasar/src/css/core/positioning.sass'`,
        `@import 'quasar/src/css/core/size.sass'`,
        `@import 'quasar/src/css/core/touch.sass'`,
        `@import 'quasar/src/css/core/transitions.sass'`,
        `@import 'quasar/src/css/core/typography.sass'`,
        `@import 'quasar/src/css/core/visibility.sass'`,
        `@import 'quasar/src/css/core/dark.sass'`,
        `@import 'quasar/src/directives/Ripple.sass'`,
        `@import 'quasar/src/directives/Morph.sass'`,
        `@import 'quasar/src/components/field//QField.sass'`,
        ...componentsCss,
        ...pluginsCss,
        `@import 'quasar/src/plugins/Loading.sass'`,
        `@import 'quasar/src/plugins/Notify.sass'`,
        `@import 'quasar/src/components/dialog/QDialog.sass'`,
        `@import 'quasar/src/components/dialog-plugin/DialogPlugin.sass'`,
        ...css?.map((v) => `@import '${v}'`)
      )
  
    return additinalData
  }

  const ctx = {
    prod: process.env.MODE === 'production',
    dev: process.env.MODE === 'development',
    mode: {
      ssr: !!ssr
    }
  }

  let quasarConf: QuasarConf
  let quasarExtensions: Record<string, any> | undefined

  let bootFilePaths: Record<string, any> = {}
  let fastifySetup = (fastify: FastifyInstance) => {}
  let sassVariables: string | false = false

  if (loadQuasarConf && appPaths) {
    const QuasarConfFile = (await import('@stefanvh/quasar-app-vite/quasar-conf-file')).default
    const QuasarConf = new QuasarConfFile(ctx, appPaths)
    quasarConf = await QuasarConf.get()

    // if (configuration?.appPaths && configuration?.loadQuasarConf) {
    //   const QuasarConfFile = (await import('@stefanvh/quasar-app-vite/quasar-conf-file')).default
    //   const QuasarConf = new QuasarConfFile(ctx, configuration.appPaths)
    //   quasarConf = await QuasarConf.get()
    // }

    if (loadQuasarExtensions) {
      const ExtensionJson = (await import('@stefanvh/quasar-app-vite/app-extension/extension-json')).default
      quasarExtensions = new ExtensionJson(appPaths).getList() || {}
    }

    if (quasarExtensions) {
      let hooks: Record<string, any> = {}
      const names = Object.keys(quasarExtensions)
      // await Object.entries(configuration.quasarExtensions).forEach(async ([key, value]) => {
      for (let index in names) {
        const name = names[index]
        const ext = new Extension(name, appPaths)
        const scripts = ext.scripts()
        const indexScript = await import(scripts.index)
        const indexApi = new IndexAPI({
          extId: name,
          ctx,
          appPaths: appPaths
        })

        indexScript.default(indexApi)
        hooks = {
          ...hooks,
          ...indexApi.__getHooks()
        }

        for (let extendQuasarConf of hooks.extendQuasarConf) {
          extendQuasarConf.fn(quasarConf)
        }
      }
    }

    if (quasarConf?.pwa) {
      isPwa = true
      extraPlugins.push(
        ...VitePWA(quasarConf.pwa)
      )
    }

    if (quasarConf?.vite) {
      if (quasarConf.vite.plugins) {
        extraPlugins.push(...(quasarConf.vite.plugins as Plugin[]))
        delete quasarConf.vite.plugins
      }
    }

    if (quasarConf?.fastify?.setup) {
      fastifySetup = quasarConf.fastify.setup
    }

    if (quasarConf.boot) {
      bootFilePaths = (quasarConf.boot as (Record<string, any> | string)[])
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
            const name = split.slice(0, split.length - 2).join('').replace(/[|&;$%@"<>()+,]/g, "");
            acc[name] = {
              // path: `/node_modules/${entry.substring(1)}`
              path: `${entry.substring(1)}`
            }
          } else {
            const name = entry.split('.')[0]
            acc[name] = {
              path: `/src/boot/${entry}`
            }
          }
          return acc
        }, {})
    }

    if (quasarConf.framework.components) {
      quasarConf.framework.components = [...new Set(quasarConf.framework.components)];
    }
    if (quasarConf.framework.plugins) {
      quasarConf.framework.plugins = [...new Set(quasarConf.framework.plugins)];
    }

    if (existsSync(appPaths.resolve.src('quasar-variables.sass'))) {
      sassVariables = 'src/quasar-variables.sass'
    }
  }

  return [
    // {
    //   name: 'legacy-support',
    //   enforce: 'pre',
    //   transform (code, id) {
    //     /**
    //      * ESM does not resolve an import to .default when there are multiple exports. The following is required to make the VuePlugin import of QCalendar work.
    //      */
    //     if (code.includes('app.use(VuePlugin)')) {
    //       code = code.replace(/app\.use\(VuePlugin\)/g, `app.use(VuePlugin.install ? VuePlugin : VuePlugin.default)`)
    //     }
    //     return code
    //   }
    // },
    {
      name: 'html-transform',
      enforce: 'pre',
      transformIndexHtml: {
        enforce: 'pre',
        transform: (html) => {
          if (appPaths?.cliDir) {
            let entry: string
            switch (ssr) {
              case 'server' || 'client':
                entry = resolve(appPaths.cliDir, 'ssr', 'entry-client.ts')
                break;
              default:
                entry = resolve(appPaths.cliDir, 'csr', 'entry.ts')
            }
            const entryScript = `<script type="module" src="${entry}"></script>`
            html = html.replace(
              '<!--entry-script-->',
              entryScript
            )
          }
          return html
        }
      }
    },
    Components({
      resolvers: [
        (name: string) => {
          if (name.match(/Q[A-Z][A-z]*/)) {
            if (name in importMap) {
              // const sideEffects = importMap[name].sideEffects ? `quasar/${importMap[name].sideEffects}` : undefined
              const sideEffects = importMap[name].sideEffects?.map((s) => `quasar/${s}`)
              return {
                path: `quasar/${importMap[name].file}`,
                sideEffects: !imported.includes(name) ? sideEffects : undefined
              }
            }
          }
        }
      ]
    }),
    {
      name: 'vite-plugin-quasar-merge-config',
      config: (config, env) => quasarConf?.vite
    },
    {
      name: 'vite-plugin-quasar',
      enforce: 'pre',
      transform (code, id, ssr) {
        // Required for the ssr argument during ssr builds (combined config for server and client)
        // code = code.replace(/__QUASAR_VERSION__/g, `'version'`)
        //   .replace(/__QUASAR_SSR__/g, (!!configuration.ssr).toString())
        //   .replace(/__QUASAR_SSR_SERVER__/g, (configuration.ssr === 'server').toString())
        //   .replace(/__QUASAR_SSR_CLIENT__/g, (configuration.ssr === 'client').toString())
        //   .replace(/__QUASAR_SSR_PWA__/g, (!!configuration.ssr && isPwa).toString())
        return code
      },
      config: (config, env) => {
        return {
          resolve: {
            alias: [
              { find: 'src', replacement: srcDir },
              { find: 'lib', replacement: resolve('appDir', 'lib' )},
              { find: 'app', replacement: appDir },
              { find: 'boot', replacement: resolve(srcDir, 'boot') },
              { find: 'assets', replacement: resolve(srcDir, 'assets') },
              { find: 'quasar/wrappers', replacement: resolve(cliDir, 'quasar-wrappers.ts') },
              { find: 'quasar/vue-plugin', replacement: resolve(quasarDir, 'src', 'vue-plugin.js') },
              { find: 'quasar/directives', replacement: resolve(quasarDir, 'src', 'directives.js') },
              { find: 'quasar/src', replacement: resolve(quasarDir, 'src') },
      
              // { find: 'quasar', replacement: resolve(appDir, 'node_modules', 'quasar', 'src', 'index.all.js') },
              { find: new RegExp('^quasar$'), replacement: resolve(appDir, 'node_modules', 'quasar', 'src', 'index.all.js') },
              // { find: '@quasar/extras', replacement: resolve(cliDir, 'node_modules', '@quasar', 'extras') },
              /** Alternative to dedupe */
              { find: 'vue', replacement: resolve(appDir, 'node_modules', 'vue') },
              { find: 'vue-router', replacement: resolve(appDir, 'node_modules', 'vue-router') },
            ]
          },
          build: {
            // ssr: (configuration?.ssr === 'server' && configuration?.appPaths?.cliDir) ? resolve(configuration.appPaths.cliDir, 'ssr', 'entry-server.ts') : false,
            ssr: (ssr === 'server' && appPaths?.cliDir) ? true : false,
            ssrManifest: ssr === 'client',
            rollupOptions: {
              input: (ssr === 'server' && appPaths?.cliDir) ? [
                resolve(appPaths.cliDir, 'ssr', 'entry-server.ts'),
                resolve(appPaths.cliDir, 'ssr', 'server.ts')
              ] : undefined
            }
          },
          // ssr: {
          //   noExternal: configuration?.ssr ? ['quasar'] : undefined
          // },
          define: {
            __DEV__: process.env.NODE_ENV !== 'production' || true,
            // Does not work
            __QUASAR_VERSION__: `'version'`,
            __QUASAR_SSR__: !!ssr,
            __QUASAR_SSR_SERVER__: ssr === 'server',
            __QUASAR_SSR_CLIENT__: ssr === 'client',
            __QUASAR_SSR_PWA__: !!ssr && isPwa
          },
          css: {
            preprocessorOptions: {
              sass: {
                additionalData: additionalDataSass(
                  {
                    components: quasarConf?.framework.components,
                    plugins: quasarConf?.framework.plugins,
                    css: quasarConf?.css,
                    sassVariables: sassVariables
                  }).join('\n') + '\n'  // New line required to prevent compilation errors (auto-import does not prepend a new line probably)
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
          case 'virtual:quasar-extensions':
            return 'virtual:quasar-extensions'
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
        if (id === 'virtual:quasar-extensions') {
          return `export const quasarExtensions = ${JSON.stringify(quasarExtensions || {})}`
        }
        if (id === 'virtual:quasar-plugins') {
            const plugins = quasarConf?.framework?.plugins
            const imports = plugins?.map((plugin: string) => `import ${plugin} from 'quasar/src/plugins/${plugin}.js'`)
            return importExportLiteral(imports, plugins)
        }
        if (id === 'virtual:quasar-components') {
            const components = quasarConf?.framework?.components
            const imports = components?.map((component: string) => `import ${component} from 'quasar/${importMap[component].file}'`)
            // const sideEffects = components
            //   ?.filter((component: string) => importMap[component].sideEffects)
            //   ?.map((component: string) => `@import 'quasar/${importMap[component].sideEffects}'`)
            return {
              code: importExportLiteral(imports, components),
              moduleSideEffects: 'no-treeshake'
            }
        }
        if (id === 'virtual:quasar-extras') {
            const extras = quasarConf?.extras
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