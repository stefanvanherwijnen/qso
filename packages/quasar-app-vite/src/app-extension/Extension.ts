import { fatal } from '@stefanvh/quasar-app-vite/helpers/logger'
import { AppPaths } from '@stefanvh/quasar-app-vite/app-paths'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
export default class Extension {
  packageFullName: string
  packageName: string
  extId: string
  appPaths: AppPaths
  constructor(name: string, appPaths: AppPaths) {
    this.appPaths = appPaths
    if (name.charAt(0) === '@') {
      const slashIndex = name.indexOf('/')
      if (slashIndex === -1) {
        fatal(`Invalid Quasar App Extension name: "${name}"`)
      }

      this.packageFullName = name.substring(0, slashIndex + 1) +
        'quasar-app-extension-' +
        name.substring(slashIndex + 1)

      this.packageName = '@' + this.__stripVersion(this.packageFullName.substring(1))
      this.extId = '@' + this.__stripVersion(name.substring(1))
    }
    else {
      this.packageFullName = 'quasar-app-extension-' + name
      this.packageName = this.__stripVersion('quasar-app-extension-' + name)
      this.extId = this.__stripVersion(name)
    }

    if (!this.isInstalled()) {
      fatal(`App extension ${name} is not installed. Aborting...`)
    }
  }

  __stripVersion (packageFullName: string) {
    const index = packageFullName.indexOf('@')

    return index > -1
      ? packageFullName.substring(0, index)
      : packageFullName
  }

  isInstalled () {
    return existsSync(this.appPaths.resolve.app('node_modules/' + this.packageName + '/package.json'))
  }

  packageJson () {
    if (this.isInstalled()) {
      return JSON.parse(readFileSync(this.appPaths.resolve.app('node_modules/' + this.packageName + '/package.json'), 'utf-8'))
    }
  }

  scripts () {
    const packageJson = this.packageJson()
    const exports = packageJson.exports
    return {
      index: resolve(this.appPaths.appDir, 'node_modules', this.packageName, (exports ? exports['.'] || exports['./index'] : 'src/index.js')),
      install: resolve(this.appPaths.appDir, 'node_modules', this.packageName, exports ? exports['./install'] : 'src/install.js'),
      uninstall: resolve(this.appPaths.appDir, 'node_modules', this.packageName, exports ? exports['./uninstall'] : 'src/uninstall.js'),
      prompts: resolve(this.appPaths.appDir, 'node_modules', this.packageName, exports ? exports['./prompts'] : 'src/prompts.js'),
    }
  }
}