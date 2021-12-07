//@ts-nocheck
export default 
`import conf from 'app/quasar.conf'
import extensions from 'virtual:quasar-extensions'

const ctx = {
  prod: import.meta.env.MODE === 'production',
  dev: import.meta.env.MODE === 'development',
  mode: {
    ssr: import.meta.SSR
  }
}
const quasarConf = typeof conf === 'function' ? conf(ctx) : conf

const IndexAPI = {
  extendQuasarConf: (fn) => fn(quasarConf),
  compatibleWith: (pkg, version) => {}
}
for (let index of Object.values(extensions)) {
  index(IndexAPI)
}
export default quasarConf`