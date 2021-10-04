import { resolve, relative, dirname } from 'path'
import ViteRequireContext from '@originjs/vite-plugin-require-context'

const plugins = (paths) => {
  return [
    ViteRequireContext.default(),
    {
      name: 'alias-plugin', // required, will show up in warnings and errors
      enforce: 'pre',
      transform: (code, id) => {
        const index = code.includes(`import('pages`)
        const relativeImport = relative(dirname(id), paths.resolve.src('pages'))

        code = code
          .replace(/process.env/g, `import.meta.env`)
          .replace(/import\('pages\/' \+ path\)/g, `import('pages/' + path + '.vue')`)
          .replace(/import\('pages\//g, `import('${relative(dirname(id), paths.resolve.src('pages'))}/`)
          .replace(/.context\('pages/g, `.context('${relative(dirname(id), paths.resolve.src('pages'))}`)
          .replace(/import\('quasar\/lang\/' \+ lang\)/g, `import('./${relative(dirname(id), paths.resolve.app('..'))}/lang' + lang + '.js')`)
          .replace(/import\('quasar\/icon-set\/' \+ set\)/g, `import('./${relative(dirname(id), paths.resolve.app('..'))}/icon-set' + set + '.js')`)

        if (index) {
          console.log(relativeImport)
        }
        return code
      },
      config: (config, env) => {
        const index = config.resolve.alias.findIndex((v) => v.find === 'quasar')
        config.resolve.alias[index] = { find: 'quasar', replacement: paths.resolve.app('..') }

        config.resolve.alias.push(
          { find: 'pages', replacement: paths.resolve.src('pages') }
        )
        return config
      }
    }
 ]
}

export default plugins