// https://github.com/quasarframework/quasar/blob/78df1f4939936fdbf591d90addf950a8f42e665b/ui/build/build.transforms.js#L11

import glob from 'glob'
import { dirname, resolve, relative as pathRelative, basename } from 'path'
import { existsSync } from 'fs'

import { fileURLToPath } from 'url';

interface AutoImport {
  kebabComponents: string[],
  pascalComponents: string[],
  components?: string[],
  directives: string[],
  importName: Record<string, string>
}


export function parseAutoImport (autoImport: AutoImport) {
  autoImport.kebabComponents.sort((a, b) => (a.length > b.length ? -1 : 1))
  autoImport.pascalComponents.sort((a, b) => (a.length > b.length ? -1 : 1))
  autoImport.components = autoImport.kebabComponents.concat(autoImport.pascalComponents)
  autoImport.directives.sort((a, b) => (a.length > b.length ? -1 : 1))

  return {
    importName: autoImport.importName,
    regex: {
      kebabComponents: '(' + autoImport.kebabComponents.join('|') + ')',
      pascalComponents: '(' + autoImport.pascalComponents.join('|') + ')',
      components: '(' + autoImport.components.join('|') + ')',
      directives: '(' + autoImport.directives.join('|') + ')'
    }
  }
}

export function generateImportMap (quasarRoot: string) {

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
    return name.replace(/-([a-z])/g, g => g[1].toUpperCase())
  }
  function relative (name: string) {
    return pathRelative(quasarRoot, name).split('\\').join('/')
  }
  function getWithoutExtension (filename: string) {
    const insertionPoint = filename.lastIndexOf('.')
    return filename.slice(0, insertionPoint)
  }
  function addComponents (map: Record<string, any>, autoImport: AutoImport) {
    glob.sync(resolvePath('src/components/**/Q*.js'))
      .map(relative)
      .forEach(file => {
        const name = getWithoutExtension(basename(file))
        const kebab = kebabCase(name)
        const sideEffects = []
        if (existsSync(resolvePath(file.replace('.js', '.sass')))) sideEffects.push(file.replace('.js', '.sass'))

        map[name] = {
          file: file,
          sideEffects
        }

        autoImport.kebabComponents.push(kebab)
        autoImport.pascalComponents.push(name)
        autoImport.importName[name] = name
        autoImport.importName[kebab] = name
      })
  }
  function addDirectives (map: Record<string, any>, autoImport: AutoImport) {
    glob.sync(resolvePath('src/directives/*.js'))
      .filter(file => file.endsWith('.ssr.js') === false)
      .map(relative)
      .forEach(file => {
        const
          name = getWithoutExtension(basename(file)),
          kebab = 'v-' + kebabCase(name)

        map[name] = {
          file: file
        }

        autoImport.kebabComponents.push(kebab)
        autoImport.pascalComponents.push(name)
        autoImport.importName[name] = name
        autoImport.importName[kebab] = name

      })
  }

  function addPlugins (map: Record<string, any>) {
    glob.sync(resolvePath('src/plugins/*.js'))
      .map(relative)
      .forEach(file => {
        const name = getWithoutExtension(basename(file))
        map[name] = {
          file: file
        }
      })
  }

  function addComposables (map: Record<string, any>) {
    glob.sync(resolvePath('src/composables/*.js'))
      .map(relative)
      .forEach(file => {
        const name = getWithoutExtension(basename(file))
        map[lowerCamelCase(name)] = {
          file: file
        }
      })
  }

  function addUtils (map: Record<string, any>) {
    glob.sync(resolvePath('src/utils/*.js'))
      .map(relative)
      .forEach(file => {
        const name = getWithoutExtension(basename(file))
        map[name === 'open-url' ? 'openURL' : lowerCamelCase(name)] = {
          file: file
        }
      })
  }

  const autoImport = {
    kebabComponents: [],
    pascalComponents: [],
    directives: [],
    importName: {}
  }

  const map: Record<string, {
    file: string,
    sideEffects?: string[]
  }> = {}
  addComponents(map, autoImport)
  addDirectives(map, autoImport)
  addPlugins(map)
  addComposables(map)
  addUtils(map)

  return {
    map,
    autoImport
  }
}