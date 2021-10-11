import vuePlugin from '@vitejs/plugin-vue'
import { QuasarPlugin } from '@stefanvh/quasar-app-vite'
import { resolve } from 'path'
import { Plugin } from 'vite'
import { AppPaths, getAppPaths } from '@stefanvh/quasar-app-vite/lib/app-paths'
import { readFileSync } from 'fs'
import { fatal } from '@stefanvh/quasar-app-vite/lib/helpers/logger'
export * from '@stefanvh/quasar-app-vite/vite-plugin-quasar'

export type VitePlugins = (paths: AppPaths) => Plugin[]

export const baseConfig = async ({
  cliDir,
  srcDir,
  appDir,
  ssr,
  plugins
}: {
  cliDir: string,
  srcDir: string,
  appDir: string,
  ssr?: 'client' | 'server' | 'ssg',
  plugins?: Plugin[]
}) => {
  const appPaths = await getAppPaths()
  if (!plugins) plugins = []
  // try {
  //   quasarConf = (await import(resolve(appDir, 'quasar.conf.js'))).default
  // } catch (e) {
  //   fatal('quasar.conf.js not found. Aborting...')
  // }

  // try {
  //   quasarExtensions = JSON.parse(readFileSync(resolve(appDir, 'quasar.extensions.json'), 'utf-8'))
  // } catch (e) { }

  return {
    root: appDir,
    plugins: [
      vuePlugin(),
      await QuasarPlugin({
        appPaths,
        ssr: ssr,
        loadQuasarConf: true,
        loadQuasarExtensions: true
      }),
      ...plugins
    ],
    resolve: {
      alias: [
        { find: 'src', replacement: srcDir },
        { find: 'boot', replacement: resolve(srcDir, 'boot') },
        { find: 'dist', replacement: resolve('dist') },
        { find: 'quasar/wrappers', replacement: resolve(cliDir, 'quasar-wrappers.ts') },
        { find: 'quasar', replacement: resolve(appDir, 'node_modules', 'quasar') },
        { find: '@quasar/extras', replacement: resolve(appDir, 'node_modules', '@quasar', 'extras') },
        { find: 'quasarConf', replacement: resolve(appDir, 'quasar.conf') },
        { find: 'quasarExtensions', replacement: resolve(appDir, 'quasar.extensions.json') }

      ]
    },
    ssr: {
      noExternal: ssr === 'server' ? ['quasar'] : []
    }
  }
}
