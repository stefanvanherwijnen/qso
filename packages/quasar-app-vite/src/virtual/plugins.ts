export default `import quasarConf from 'virtual:quasar-conf'

const quasarPlugins = await import('quasar/src/plugins.js')
const plugins = quasarConf.framework.plugins.map((plugin) => quasarPlugins[plugin])

export default plugins`