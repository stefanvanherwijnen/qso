import { generateImportMap } from "./import-map.js"
import { promises } from 'fs'
// const quasarRoot = import.meta.resolve!('quasar')
const { map, autoImport } = generateImportMap(new URL('../node_modules/quasar', import.meta.url).pathname)
promises.writeFile(new URL('./auto-import.json', import.meta.url), JSON.stringify({
  importName: autoImport.importName,
  regex: {
    kebabComponents: '(' + autoImport.kebabComponents.join('|') + ')',
    pascalComponents: '(' + autoImport.pascalComponents.join('|') + ')',
    directives: '(' + autoImport.directives.join('|') + ')'
  }
}, null, 2))
