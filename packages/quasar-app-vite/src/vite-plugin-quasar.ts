import type { Plugin, ResolvedConfig } from 'vite'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import Components from 'unplugin-vue-components/vite'
import { resolve } from 'path'
import { generateImportMap, parseAutoImport } from '@stefanvh/quasar-app-vite/lib/import-map'
import { AppPaths } from '@stefanvh/quasar-app-vite/lib/app-paths'
import { existsSync } from 'fs'
import { join, sep, normalize } from 'path'
import { fatal } from '@stefanvh/quasar-app-vite/lib/helpers/logger'
function getQuasarDir () {
  let dir = process.cwd()

  while (dir.length && dir[dir.length - 1] !== sep) {
    if (existsSync(join(dir, 'node_modules', 'quasar'))) {
      return join(dir, 'node_modules', 'quasar')
    }

    dir = normalize(join(dir, '..'))
  }
}
export const quasarDir = getQuasarDir()
if (!quasarDir) fatal('Quasar directory not found')
const { map: importMap, autoImport } = generateImportMap(quasarDir!)
import IndexAPI from '@stefanvh/quasar-app-vite/lib/app-extension/IndexAPI'
import Extension from '@stefanvh/quasar-app-vite/lib/app-extension/Extension'
import { QuasarConf } from '@stefanvh/quasar-app-vite/lib/quasar-conf-file'
const imported: string[] = []

/**
 * Proper indentation is required
 */
const additionalDataSass = (components: string[] = [], plugins: string[] = [], css: string[] = []) => {
  css = css?.map((v => {
    if (v[0] === '~') {
      return v.slice(1)
    }
    return v
  }))

  const componentsCss = components
    ?.filter((component) => importMap[component].sideEffects?.length)
    .map((component) => importMap[component].sideEffects?.map((s) => `@import 'quasar/${s}'`).join('\n')).join('\n')


  const pluginsCss = plugins
    ?.filter((plugin) => importMap[plugin].sideEffects?.length)
    .map((plugin) => importMap[plugin].sideEffects?.map((s) => `@import 'quasar/${s}'`).join('\n')).join('\n')

  imported.push(...components)
  imported.push(...plugins)

  return `@import 'quasar/src/css/helpers/string.sass'
@import 'quasar/src/css/helpers/math.sass'
@import 'quasar/src/css/variables.sass'
@import 'quasar/src/css/normalize.sass'
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
/* Directives */
@import 'quasar/src/directives/Ripple.sass'
@import 'quasar/src/directives/Morph.sass'
/* Components */
${componentsCss}
/* Plugins */
${pluginsCss}
@import 'quasar/src/plugins/Loading.sass'
@import 'quasar/src/plugins/Notify.sass'
/* CSS */
${css?.map((v) => `@import '${v}'`).join('\n')}
`
}
const importExportLiteral = (imports: string[] = [], exports: string[] = []) => `${imports.join('\n')}

export default {
  ${exports.join(',\n')}
}
`

function lowerCamelCase (name: string) {
  return name.replace(/-([a-z])/g, g => g[1].toUpperCase())
}

export const QuasarAutoImportPlugin = Components({
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
})

// Should be an argument to the plugin
export interface Configuration {
  appPaths: AppPaths,
  ssr?: 'server' | 'client' | 'ssg',
  injectEntry?: boolean,
  loadQuasarConf?: boolean,
  loadQuasarExtensions?: boolean
}

export const QuasarPlugin = async (configuration: Configuration): Promise<Plugin[]> => {
  const extraPlugins: Plugin[] = []
  // if (configuration?.pwa) extraPlugins.push(
  //   ...VitePWA(configuration.pwa)
  // )

  let isPwa = false

  const ctx = {
    prod: process.env.MODE === 'production',
    dev: process.env.MODE === 'development',
    mode: {
      ssr: !!configuration?.ssr
    }
  }

  let quasarConf: QuasarConf
  let quasarExtensions: Record<string, any> | undefined

  const QuasarConfFile = (await import('@stefanvh/quasar-app-vite/lib/quasar-conf-file')).default
  const QuasarConf = new QuasarConfFile(ctx, configuration.appPaths)
  quasarConf = await QuasarConf.get()

  // if (configuration?.appPaths && configuration?.loadQuasarConf) {
  //   const QuasarConfFile = (await import('@stefanvh/quasar-app-vite/lib/quasar-conf-file')).default
  //   const QuasarConf = new QuasarConfFile(ctx, configuration.appPaths)
  //   quasarConf = await QuasarConf.get()
  // }

  if (configuration?.appPaths && configuration?.loadQuasarExtensions) {
    const ExtensionJson = (await import('@stefanvh/quasar-app-vite/lib/app-extension/extension-json')).default
    quasarExtensions = new ExtensionJson(configuration.appPaths).getList() || {}
  }

  if (quasarConf?.pwa) {
    isPwa = true
    extraPlugins.push(
      ...VitePWA(quasarConf.pwa)
    )
  }

  if (quasarConf?.vite?.plugins) {
    extraPlugins.push(...quasarConf.vite.plugins)
  }

  if (quasarExtensions) {
    let hooks: Record<string, any> = {}
    const names = Object.keys(quasarExtensions)
    // await Object.entries(configuration.quasarExtensions).forEach(async ([key, value]) => {
    for (let index in names) {
      const name = names[index]
      const ext = new Extension(name, configuration.appPaths)
      const scripts = ext.scripts()
      const indexScript = await import(scripts.index)
      const indexApi = new IndexAPI({
        extId: name,
        ctx,
        appPaths: configuration.appPaths
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

  let bootFilePaths: Record<string, any> = {}
  if (quasarConf.boot) {
    bootFilePaths = (quasarConf.boot as (Record<string, any> | string)[])
      .filter(entry => {
        if (typeof entry === 'object') return (entry.server && (configuration.ssr === 'server'))
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
            path: `/node_modules/${entry.substring(1)}`
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
    {
      name: 'html-transform',
      enforce: 'pre',
      transformIndexHtml: {
        enforce: 'pre',
        transform: (html) => {
          if (configuration?.appPaths?.cliDir) {
            let entry: string
            switch (configuration?.ssr) {
              case 'server' || 'client':
                entry = resolve(configuration.appPaths.cliDir, 'ssr', 'entry-client.ts')
                break;
              default:
                entry = resolve(configuration.appPaths.cliDir, 'spa', 'entry.ts')
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
    QuasarAutoImportPlugin,
    {
      name: 'vite-plugin-quasar',
      enforce: 'pre',
      transform (code, id, ssr) {
        // Required for the ssr argument during ssr builds (combined config for server and client)
        code = code.replace(/__QUASAR_VERSION__/g, `'version'`)
          .replace(/__QUASAR_SSR__/g, (!!ssr).toString())
          .replace(/__QUASAR_SSR_SERVER__/g, (!!ssr).toString())
          .replace(/__QUASAR_SSR_CLIENT__/g, false.toString())
          .replace(/__QUASAR_SSR_PWA__/g, (!!ssr && isPwa).toString())
        return code
      },
      config: (config, env) => {
        return {
          resolve: {
            alias: quasarConf.vite?.alias
          },
          build: {
            ssr: (configuration?.ssr === 'server' && configuration?.appPaths?.cliDir) ? resolve(configuration.appPaths.cliDir, 'ssr', 'entry-server.ts') : false,
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
                additionalData: additionalDataSass(quasarConf?.framework.components, quasarConf?.framework.plugins, quasarConf?.css)
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
          default:
            return;
        }
      },
      load (id) {
        if (quasarConf) {
          if (id === 'virtual:quasar-conf') {
            return `export const quasarConf = ${JSON.stringify(quasarConf)}`
          }
          if (id === 'virtual:quasar-extensions') {
            return `export const quasarExtensions = ${JSON.stringify(quasarExtensions)}`
          }
          if (id === 'virtual:quasar-plugins') {
            const plugins = quasarConf.framework?.plugins
            const imports = plugins?.map((plugin: string) => `import ${plugin} from 'quasar/src/plugins/${plugin}.js'`)
            return importExportLiteral(imports, plugins)
          }
          if (id === 'virtual:quasar-components') {
            const components = quasarConf.framework?.components
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
            const extras = quasarConf.extras
            const imports = extras?.map((extra: string) => `import ${lowerCamelCase(extra)} from '@quasar/extras/${extra}/${extra}.css'`)
            return importExportLiteral(imports, extras.map((extra: string) => lowerCamelCase(extra)))
          }
          if (id === 'virtual:quasar-boot') {
            const bootFiles = Object.keys(bootFilePaths)
            const imports = bootFiles?.map((boot: string) => `import ${lowerCamelCase(boot)} from '${bootFilePaths[boot].path}'`)
            return importExportLiteral(imports, bootFiles.map((boot: string) => lowerCamelCase(boot)))
          }
        }
        return null
      }
    },
    ...extraPlugins
  ]
}

export default QuasarPlugin