import vuePlugin from '@vitejs/plugin-vue'
import { InlineConfig, Plugin } from 'vite'
import { readFileSync, existsSync } from 'fs'
import { QuasarPlugin } from './vite-plugin-quasar.js'
import builtinModules from 'builtin-modules'
import { getAppExtensionPath } from './app-extension/api.js'
import { appDir, cliDir, srcDir } from './app-urls.js'

export const baseConfig = async ({
  ssr,
  paths
}: {
  ssr?: 'client' | 'server' | 'ssg',
  paths?: {
    appDir: URL,
    srcDir: URL
  }
}): Promise<InlineConfig> => {
  let appDir: URL
  let cliDir: URL
  let srcDir: URL
  if (paths) {
    appDir = paths.appDir
    srcDir = paths.srcDir;
    ({ cliDir } = await import('./app-urls.js'))
  } else {
    ({ appDir, cliDir, srcDir } = await import('./app-urls.js'))
  }
  /**
   * TODO:Perform some manual check if command is run inside a Quasar Project
   */
  const packageJson = JSON.parse(readFileSync(new URL('package.json', appDir).pathname, { encoding: 'utf-8' }))

  const quasarConf = (await import(new URL('quasar.conf.js', appDir).pathname)).default
  const quasarExtensionsPath = new URL('quasar.extensions.json', appDir).pathname
  const quasarSassVariablesPath = new URL('quasar-variables.sass', srcDir).pathname

  let quasarExtensions
  if (existsSync(quasarExtensionsPath)) {
    quasarExtensions = JSON.parse(readFileSync(quasarExtensionsPath, { encoding: 'utf-8' }))
  }

  const ssrTransformCustomDir = () => {
    return {
      props: [],
      needRuntime: true
    }
  }

  let quasarExtensionIndexScripts = []
  if (quasarExtensions) {
    for (let ext of Object.keys(quasarExtensions)) {
      const path = getAppExtensionPath(ext)
      const { main, exports } = JSON.parse(readFileSync(new URL(`node_modules/${path}/package.json`, appDir).pathname, 'utf-8'))
      
      let IndexAPI
      try {
        ({ IndexAPI } = (await import(new URL(exports['./api'], new URL(`node_modules/${path}/`, appDir)).pathname)))
      } catch (e) {
        console.log(e)
        try {
          ({ IndexAPI } = (await import(new URL(main, new URL(`node_modules/${path}/`, appDir)).pathname)))
        } catch (e) {
          IndexAPI = (await import(new URL('src/index.js', new URL(`node_modules/${path}/`, appDir)).pathname)).default
        }
      }
      quasarExtensionIndexScripts.push(IndexAPI)
    }
  }

  let quasarSassVariables: boolean = false
  if (existsSync(quasarSassVariablesPath)) {
    quasarSassVariables = true
  }

  return {
    root: cliDir.pathname,
    publicDir: new URL('public/', appDir).pathname,
    plugins: [
      {
        name: 'html-transform',
        enforce: 'pre',
        transformIndexHtml: {
          enforce: 'pre',
          transform: (html) => {
            let entry: string
            switch (ssr) {
              case 'ssg':
              case 'client':
                entry = new URL('ssr/entry-client.ts', cliDir).pathname
                break;
              default:
                entry = new URL('csr/entry.ts', cliDir).pathname
            }
            const entryScript = `<script type="module" src="${entry}"></script>`
            html = html.replace(
              '<!--entry-script-->',
              entryScript
            ).replace(
              '<!--product-name-->',
              packageJson.productName
            )
            return html
          }
        }
      },
      vuePlugin(
        {
          template: {
            ssr: !!ssr,
            compilerOptions: {
              directiveTransforms: {
                'close-popup': ssrTransformCustomDir,
                'intersection': ssrTransformCustomDir,
                'ripple': ssrTransformCustomDir,
                'mutation': ssrTransformCustomDir,
                'morph': ssrTransformCustomDir,
                'scroll': ssrTransformCustomDir,
                'scroll-fire': ssrTransformCustomDir,
                'touch-hold': ssrTransformCustomDir,
                'touch-pan': ssrTransformCustomDir,
                'touch-repeat': ssrTransformCustomDir,
                'touch-swipe': ssrTransformCustomDir
              }
            }
          }
        }
      ),
      QuasarPlugin({
        quasarConf,
        quasarExtensionIndexScripts,
        quasarSassVariables,
        ssr: ssr,
      })
    ],
    optimizeDeps: {
      exclude: ['vue']
    },
    resolve: {
      // Dedupe uses require which breaks ESM SSR builds
      // dedupe: [
      //   'vue',
      //   'vue-router'
      // ],
      alias: [
        { find: 'src', replacement: srcDir.pathname },
        { find: 'app', replacement: appDir.pathname },
        { find: 'boot', replacement: new URL('boot/', srcDir).pathname },
        { find: 'assets', replacement: new URL('assets/', srcDir).pathname },
        { find: 'vue', replacement: new URL('node_modules/vue', appDir).pathname },
        { find: 'vue-router', replacement: new URL('node_modules/vue-router', appDir).pathname }
      ]
    },
    build: {
      ssr: (ssr === 'server') ? true : false,
      ssrManifest: (ssr === 'client' || ssr === 'ssg'),
      rollupOptions: {
        input: (ssr === 'server') ? [
          new URL('ssr/entry-server.ts', cliDir).pathname,
          new URL('ssr/server.ts', cliDir).pathname
        ] : undefined,
        output: {
          format: 'es'
        }
      }
    },
    // @ts-ignore
    ssr: {
      // Externalize only Node built in modules and fastify and express in order to create a bundle
      noExternal: [
        new RegExp(`^(?!.*(${builtinModules.join('|')}|fastify|express))`)
      ]
    }
  }
}

export { QuasarPlugin }