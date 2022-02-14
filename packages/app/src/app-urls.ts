export const appDir = new URL(`file://${process.cwd()}/`)
export const cliDir = new URL('../', import.meta.url)
export const srcDir = new URL('src/', appDir)
export const quasarDir = new URL('node_modules/quasar/', appDir)

export const parsePath = (path: string) => {
  if (path) {
    if (path.slice(-1) !== '/') path += '/'
    if (path.startsWith('.')) {
      return new URL(path, appDir)
    } else if (path) {
      return new URL(`file://${path}`)
    }
  }
  return
}