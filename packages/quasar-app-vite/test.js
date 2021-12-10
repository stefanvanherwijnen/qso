import { pathToFileURL } from 'url'
const appDir = new URL(`file://${process.cwd()}/`)

//const srcDir = new URL('src/', 'file:///home/stefan/HomeLaptop/Projects/simsustech/quasar-app-vite/packages/quasar-app-vite/')
const srcDir = new URL('src/', appDir)
console.log(appDir, srcDir, import.meta.url)
