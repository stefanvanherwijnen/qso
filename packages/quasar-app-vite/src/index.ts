import vuePlugin from '@vitejs/plugin-vue'
import { QuasarPlugin } from '@stefanvh/quasar-app-vite/vite-plugin-quasar'
import { resolve } from 'path'
import { Plugin, InlineConfig } from 'vite'
import { AppPaths, getAppPaths } from '@stefanvh/quasar-app-vite/app-paths'
import { readFileSync, existsSync } from 'fs'
import { sep, normalize, join } from 'path'
import { fatal } from '@stefanvh/quasar-app-vite/helpers/logger'
export * from '@stefanvh/quasar-app-vite/vite-plugin-quasar'

export type VitePlugins = (paths: AppPaths) => Plugin[]

const resolveNodeModules = (initialDir: string, pkgName: string) => {
  let dir = initialDir

  while (dir.length && dir[dir.length - 1] !== sep) {
    if (existsSync(join(dir, 'node_modules', pkgName))) {
      return join(dir, 'node_modules', pkgName)
    }

    dir = normalize(join(dir, '..'))
  }
}
export const baseConfig = async ({
  ssr,
  appPaths
}: {
  ssr?: 'client' | 'server' | 'ssg',
  appPaths: AppPaths
}): Promise<InlineConfig> => {
  // const appPaths = await getAppPaths(initialAppDir)
  const { cliDir, srcDir, appDir } = appPaths
  // try {
  //   quasarConf = (await import(resolve(appDir, 'quasar.conf.js'))).default
  // } catch (e) {
  //   fatal('quasar.conf.js not found. Aborting...')
  // }

  // try {
  //   quasarExtensions = JSON.parse(readFileSync(resolve(appDir, 'quasar.extensions.json'), 'utf-8'))
  // } catch (e) { }

  const ssrTransformCustomDir = () => {
    return {
      props: [],
      needRuntime: true
    }
  }

  let quasarDir = resolveNodeModules(appDir, 'quasar')|| resolve(appDir, 'node_modules', 'quasar' )

  return {
    root: appDir,
    plugins: [
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
        appPaths,
        ssr: ssr,
        loadQuasarConf: true,
        loadQuasarExtensions: true
      })
    ],
    resolve: {
      dedupe: [
        'vue',
        'vue-router'
      ],
      alias: [
        { find: 'src', replacement: srcDir },
        { find: 'app', replacement: appDir },
        { find: 'boot', replacement: resolve(srcDir, 'boot') },
        { find: 'assets', replacement: resolve(srcDir, 'assets') },
        { find: 'dist', replacement: resolve('dist') },
        { find: 'quasar/wrappers', replacement: resolve(cliDir, 'quasar-wrappers.ts') },
        { find: 'quasar', replacement: resolve(appDir, 'node_modules', 'quasar') },
        // { find: '@quasar/extras', replacement: resolve(appDir, 'node_modules', '@quasar', 'extras') },
        // { find: 'quasar/', replacement: quasarDir + '/' },
        // { find: 'quasar', replacement: resolve(quasarDir, 'src', 'index.all.js') },
        { find: '@quasar/extras', replacement: resolveNodeModules(appDir, '@quasar/extras') || resolve(appDir, 'node_modules', '@quasar', 'extras') },
        { find: 'quasarConf', replacement: resolve(appDir, 'quasar.conf') },
        { find: 'quasarExtensions', replacement: resolve(appDir, 'quasar.extensions.json') }
      ]
    },
    // // @ts-ignore
    // ssr: {
    //   noExternal: ssr === 'server' ? ['quasar'] : []
    // }
  }
}
