import vuePlugin from '@vitejs/plugin-vue'
import { QuasarPlugin } from '@stefanvh/quasar-app-vite'
import { resolve } from 'path'
import { Plugin } from 'vite'
import appPaths from '@stefanvh/quasar-app-vite/lib/app-paths'

export * from '@stefanvh/quasar-app-vite/vite-plugin-quasar'

export type VitePlugins = (paths: typeof appPaths) => Plugin[]

export const baseConfig = ({
    cliDir,
    srcDir,
    appDir,
    ssr,
    plugins
  }: {
    cliDir: string,
    srcDir: string,
    appDir: string, 
    ssr?:  'client' | 'server' | 'ssg',
    plugins?: Plugin[]
  }) => {
    console.log(plugins)
    if (!plugins) plugins = []
    return {
      root: cliDir,
      plugins: [
        vuePlugin(),
        QuasarPlugin({
          ssr: ssr
        }),
        ...plugins
      ],
      resolve: {
        alias: [
          { find: 'src', replacement: srcDir },
          { find: 'dist', replacement: resolve('dist') },
          { find: 'quasar', replacement: resolve(appDir, 'node_modules', 'quasar') },
          { find: '@quasar/extras', replacement: resolve(appDir, 'node_modules', '@quasar', 'extras') },
          { find: 'quasarConf', replacement: resolve(appDir, 'quasar.conf')}
        ]
      },
      ssr: {
        noExternal: ssr === 'server' ? ['quasar'] : []
      }
    }
  }
  