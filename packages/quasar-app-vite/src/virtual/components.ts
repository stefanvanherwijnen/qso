export default `import quasarConf from 'virtual:quasar-conf'

const quasarComponents = await import('quasar/src/components.js')
const components = quasarConf.framework.components.map((component) => quasarComponents[component])

export default components`