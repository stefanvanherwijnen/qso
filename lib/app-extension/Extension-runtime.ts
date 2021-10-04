import fs from 'fs-extra'
import path from 'path'

import { log, warn, fatal } from '@stefanvh/quasar-app-vite/lib//helpers/logger'
import { spawnSync } from '@stefanvh/quasar-app-vite/lib/helpers/spawn'
import extensionJson from '@stefanvh/quasar-app-vite/lib/app-extension/extension-json'

export default class Extension {
  packageFullName: string
  packageName: string
  extId: string
  constructor(name: string) {
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
  }

  async run (ctx: Record<string, any>) {
    if (!(await this.isInstalled())) {
      warn(`Quasar App Extension "${this.extId}" is missing...`)
      // process.exit(1, 'ext-missing')
      process.exit(1)
    }

    const script = await this.__getScript('index', true)
    const IndexAPI = (await import('@stefanvh/quasar-app-vite/lib/app-extension/IndexAPI')).default

    const api = new IndexAPI({
      extId: this.extId,
      prompts: extensionJson.getPrompts(this.extId),
      ctx
    })

    log(`Running "${this.extId}" Quasar App Extension...`)
    await script(api)

    return api.__getHooks()
  }

  async __getScript (scriptName: string, fatalError?: boolean) {
    return import(this.packageName + '/src/' + scriptName).then(v => v.default)
      .catch((e) => {
        if (fatalError) {
          fatal(`App Extension "${this.extId}" has missing ${scriptName} script...`)
        }
        return
      })
  }

  async isInstalled () {
    return import('app/node_modules/' + this.packageName + '/src/index')
      .then(v => true)
      .catch(e => console.log(e))
  }

  __stripVersion (packageFullName: string) {
    const index = packageFullName.indexOf('@')

    return index > -1
      ? packageFullName.substring(0, index)
      : packageFullName
  }

}
