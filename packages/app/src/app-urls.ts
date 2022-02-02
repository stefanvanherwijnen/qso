export const appDir = new URL(`file://${process.cwd()}/`)
export const cliDir = new URL('../', import.meta.url)
export const srcDir = new URL('src/', appDir)
export const quasarDir = new URL('node_modules/quasar/', appDir)