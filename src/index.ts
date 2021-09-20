import vuePlugin from '@vitejs/plugin-vue'
import { QuasarPlugin } from '@stefanvh/quasar-app-vite'
import { resolve } from 'path'

export * from '@stefanvh/quasar-app-vite/vite-plugin-quasar'

export const baseConfig = ({
    cliDir,
    srcDir,
    appDir,
    ssr
  }: {
    cliDir: string,
    srcDir: string,
    appDir: string, 
    ssr?:  'client' | 'server' | 'ssg' }
  ) => ({
    root: cliDir,
    plugins: [
      vuePlugin(),
      QuasarPlugin({
        ssr: ssr
      })
    ],
    resolve: {
      alias: [
        { find: 'src', replacement: srcDir },
        { find: 'dist', replacement: resolve('dist') },
        { find: 'quasar', replacement: resolve(appDir, 'node_modules', 'quasar') }
      ]
    },
    ssr: {
      noExternal: ssr === 'server' ? ['quasar'] : []
    }
  })
  