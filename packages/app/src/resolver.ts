import { readFileSync } from 'fs'
import { ComponentResolver } from 'unplugin-vue-components'
export const QuasarResolver = (quasarDir: URL): ComponentResolver => {
  const components = JSON.parse(readFileSync(new URL('dist/transforms/api-list.json', quasarDir), { encoding: 'utf-8' }))
  return {
    type: 'component',
    resolve: (name: string) => {
      if (components.includes(name))
        return { importName: name, path: 'quasar' }
    }
  }
}