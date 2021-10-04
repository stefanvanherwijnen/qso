// https://github.com/quasarframework/quasar/blob/dev/app/lib/app-paths.js
import fs from 'fs'
import { normalize, resolve, join, sep } from 'path'
import { fileURLToPath } from 'url';

async function getAppDir (): Promise<string> {
  let dir = process.cwd()

  while (dir.length && dir[dir.length - 1] !== sep) {
    if (fs.existsSync(join(dir, 'quasar.conf.js')) || fs.existsSync(join(dir, 'quasar.conf.ts'))) {
      return dir
    }

    dir = normalize(join(dir, '..'))
  }

  const { fatal } = await import('@stefanvh/quasar-app-vite/lib/helpers/logger')

  return fatal(`Error. This command must be executed inside a Quasar v1+ project folder.`)
}

async function getCliDir (): Promise<string> {
  // Replace with import.meta.resolve in the future
  let dir = fileURLToPath(import.meta.url)
  while (dir.length && dir[dir.length - 1] !== sep) {
    if (fs.existsSync(join(dir, 'main.ts')) && fs.existsSync(join(dir, 'index.html'))) {
      return dir
    }

    dir = normalize(join(dir, '..'))
  }

  const { fatal } = await import('@stefanvh/quasar-app-vite/lib/helpers/logger')

  return fatal(`Error. Vite configuration file not found.`)
} 

const appDir = await getAppDir()
const cliDir = await getCliDir()
const srcDir = resolve(appDir, 'src')
const pwaDir = resolve(appDir, 'src-pwa')
const ssrDir = resolve(appDir, 'src-ssr')
const cordovaDir = resolve(appDir, 'src-cordova')
const capacitorDir = resolve(appDir, 'src-capacitor')
const electronDir = resolve(appDir, 'src-electron')
const bexDir = resolve(appDir, 'src-bex')

export default {
  cliDir,
  appDir,
  srcDir,
  pwaDir,
  ssrDir,
  cordovaDir,
  capacitorDir,
  electronDir,
  bexDir,

  resolve: {
    cli: (dir: string) => join(cliDir, dir),
    app: (dir: string) => join(appDir, dir),
    src: (dir: string) => join(srcDir, dir),
    pwa: (dir: string) => join(pwaDir, dir),
    ssr: (dir: string) => join(ssrDir, dir),
    cordova: (dir: string) => join(cordovaDir, dir),
    capacitor: (dir: string) => join(capacitorDir, dir),
    electron: (dir: string) => join(electronDir, dir),
    bex: (dir: string) => join(bexDir, dir)
  }
}
