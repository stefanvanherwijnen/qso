import fs from 'fs'

import appPaths from '@stefanvh/quasar-app-vite/lib/app-paths'
import { sync as spawn } from 'cross-spawn'
import { warn } from '@stefanvh/quasar-app-vite/lib/helpers/logger'

function isInstalled (cmd: string) {
  try {
    return spawn(cmd, ['--version']).status === 0
  }
  catch (err) {
    return false
  }
}

function getPackager () {
  if (fs.existsSync(appPaths.resolve.app('yarn.lock'))) {
    return 'yarn'
  }

  if (fs.existsSync(appPaths.resolve.app('package-lock.json'))) {
    return 'npm'
  }

  if (isInstalled('yarn')) {
    return 'yarn'
  }

  if (isInstalled('npm')) {
    return 'npm'
  }

  warn('Please install Yarn or NPM before running this command.\n')
  throw new Error
}

export default getPackager()
