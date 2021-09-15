// https://github.com/quasarframework/quasar/blob/78df1f4939936fdbf591d90addf950a8f42e665b/ui/build/build.transforms.js#L11

import glob from 'glob'
import { dirname, resolve, relative as pathRelative, basename } from 'path'
import { existsSync } from 'fs'

import { fileURLToPath } from 'url';

export function generateImportMap(quasarRoot: string) {

  // const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
  // Import from node_modules
  // const quasarRoot = resolve(appDir, 'node_modules', 'quasar')
  const resolvePath = (file: string) => resolve(quasarRoot, file)


  const kebabRegex = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g
  function kebabCase (str: string) {
    return str.replace(
      kebabRegex,
      match => '-' + match.toLowerCase()
    ).substring(1)
  }
  function lowerCamelCase (name: string) {
    return name.replace(/-([a-z])/g, g => g[ 1 ].toUpperCase())
  }
  function relative (name: string) {
    return pathRelative(quasarRoot, name).split('\\').join('/')
  }
  function getWithoutExtension (filename: string) {
    const insertionPoint = filename.lastIndexOf('.')
    return filename.slice(0, insertionPoint)
  }
  function addComponents (map: Record<string, any>) {
    glob.sync(resolvePath('src/components/**/Q*.js'))
      .map(relative)
      .forEach(file => {
        const name = getWithoutExtension(basename(file))
        map[ name ] = {
          file: file,
          sideEffects: existsSync(resolvePath(file.replace('.js', '.sass'))) ? file.replace('.js', '.sass') : undefined
        }
      })
  }
  function addDirectives (map: Record<string, any>) {
    glob.sync(resolvePath('src/directives/*.js'))
      .filter(file => file.endsWith('.ssr.js') === false)
      .map(relative)
      .forEach(file => {
        const
          name = getWithoutExtension(basename(file)),
          kebab = 'v-' + kebabCase(name)

        map[ name ] = {
          file: file
        }

      })
  }

  function addPlugins (map: Record<string, any>) {
    glob.sync(resolvePath('src/plugins/*.js'))
      .map(relative)
      .forEach(file => {
        const name = getWithoutExtension(basename(file))
        map[ name ] = {
          file: file
        }
      })
  }

  function addComposables (map: Record<string, any>) {
    glob.sync(resolvePath('src/composables/*.js'))
      .map(relative)
      .forEach(file => {
        const name = getWithoutExtension(basename(file))
        map[ lowerCamelCase(name) ] = {
          file: file
        }
      })
  }

  function addUtils (map: Record<string, any>) {
    glob.sync(resolvePath('src/utils/*.js'))
      .map(relative)
      .forEach(file => {
        const name = getWithoutExtension(basename(file))
        map[ name === 'open-url' ? 'openURL' : lowerCamelCase(name) ] = {
          file: file
        }
      })
  }

  const map: Record<string, {
    file: string,
    sideEffects?: string
  }> = {}
  addComponents(map)
  addDirectives(map)
  addPlugins(map)
  addComposables(map)
  addUtils(map)
  return map
}