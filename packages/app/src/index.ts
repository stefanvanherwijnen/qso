import vuePlugin from '@vitejs/plugin-vue'
import { InlineConfig, mergeConfig, UserConfig } from 'vite'
import { readFileSync } from 'fs'
import { QuasarPlugin } from './vite-plugin-quasar.js'
import builtinModules from 'builtin-modules'
import { QuasarResolver } from './resolver.js'
import { resolve } from 'import-meta-resolve'

export const baseConfig = async ({
  ssr,
  appDir,
  publicDir,
  command = 'build',
  mode = 'production'
}: {
  ssr?: 'client' | 'server' | 'ssg',
  appDir?: URL,
  publicDir?: URL,
  command?: 'build' | 'serve',
  mode?: string
}): Promise<InlineConfig> => {
  let cliDir: URL
  let srcDir: URL
  let cwd: URL
  let quasarDir: URL
  let vueDir: URL
  let vueRouterDir: URL
  if (appDir) {
    srcDir = new URL('src/', appDir);
    quasarDir = new URL(await resolve('quasar/', appDir.href));
    ({ appDir: cwd, cliDir } = await import('./app-urls.js'))
  } else {
    ({ appDir, cliDir, srcDir, quasarDir } = await import('./app-urls.js'))
    cwd = appDir
  }
  vueDir = new URL('./', await resolve('vue', appDir.href));
  vueRouterDir = new URL('../', await resolve('vue-router', appDir.href));

  if (!publicDir) publicDir = new URL('public/', appDir)
  /**
   * TODO:Perform some manual check if command is run inside a Quasar Project
   */
  let viteConfig
  try {
    viteConfig = (await import(new URL('quasar.config.js', appDir).pathname)).default
  } catch (e) {
    console.log('No quasar.config.js file found, using defaults')
    viteConfig = {}
  }
  let { productName = 'Product name' } = JSON.parse(readFileSync(new URL('package.json', appDir).pathname, { encoding: 'utf-8' }))

  const ssrTransformCustomDir = () => {
    return {
      props: [],
      needRuntime: true
    }
  }

  return mergeConfig({
    root: cliDir.pathname,
    publicDir: publicDir.pathname,
    // @ts-ignore
    quasar: {
      appDir,
      cliDir,
      srcDir,
      quasarDir,
      cwd,
      productName
    },
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
              case 'server':
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
      await QuasarPlugin({
        ssr: ssr,
        quasarDir
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
        { find: 'cwd', replacement: cwd.pathname },
        { find: 'boot', replacement: new URL('boot/', srcDir).pathname },
        { find: 'assets', replacement: new URL('assets/', srcDir).pathname },
        { find: 'vue', replacement: vueDir.pathname },
        { find: 'vue-router', replacement: vueRouterDir.pathname },
        { find: '@qso/app', replacement: cliDir.pathname }
      ]
    },
    build: {
      target: (ssr === 'server') ? 'esnext' : 'modules',
      ssr: (ssr === 'server') ? true : false,
      ssrManifest: (ssr === 'client' || ssr === 'ssg'),
      rollupOptions: (ssr === 'server') ? {
        input: [
          new URL('ssr/entry-server.ts', cliDir).pathname,
          new URL('ssr/server.ts', cliDir).pathname
        ],
        output: {
          minifyInternalExports: false,
          entryFileNames: '[name].mjs',
          chunkFileNames: '[name].mjs',
          format: 'es',
          manualChunks: (id) => {
            if (id.includes('fastify-ssr-plugin')) {
              return 'fastify-ssr-plugin'
            }
          }
        }
      } : {
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
    },
    define: {
      __BASE_URL__: `'/'`
    }
  } as UserConfig, viteConfig)
}

export { QuasarPlugin, QuasarResolver }