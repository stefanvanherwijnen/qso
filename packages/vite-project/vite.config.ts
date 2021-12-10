import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { QuasarPlugin } from '@stefanvh/quasar-app-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), QuasarPlugin({
    quasarConf: {
      framework: {
        plugins: [
          'Dialog',
          'Notify'
        ],
        components: []
      }
    }
  })]
})
