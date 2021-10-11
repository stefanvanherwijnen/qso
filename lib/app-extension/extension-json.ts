import fs from 'fs'
import { log, fatal } from '@stefanvh/quasar-app-vite/lib/helpers/logger'
import chalk from 'chalk'
import { AppPaths } from '@stefanvh/quasar-app-vite/lib/app-paths'

class ExtensionJson {
  extensionPath: string
  extensions: Record<string, any> = {}
  constructor(appPaths: AppPaths) {
    this.extensionPath = appPaths.resolve.app('quasar.extensions.json')

    try {
      this.extensions = JSON.parse(fs.readFileSync(this.extensionPath, 'utf-8'))
    }
    catch (e) {
      console.log(e)
      fatal('quasar.extensions.json is malformed', 'FAIL')
    }
  }

  list () {
    if (Object.keys(this.extensions).length === 0) {
      log(' No App Extensions are installed')
      log(' You can look for "quasar-app-extension-*" in npm registry.')
      return
    }

    log('Listing installed App Extensions')
    log()

    for (let ext in this.extensions) {
      console.log('Extension name: ' + chalk.green(ext))
      console.log('Extension prompts: ' + JSON.stringify(this.extensions[ext], null, 2))
      console.log()
    }
  }

  getList () {
    return this.extensions
  }

  set (extId: string, opts: Record<string, any>) {
    log(`Updating /quasar.extensions.json for "${extId}" extension ...`)
    this.extensions[extId] = opts
    this.__save()
  }

  setInternal (extId: string, opts: Record<string, any>) {
    const cfg = this.get(extId)
    cfg.__internal = opts
    this.set(extId, cfg)
  }

  remove (extId: string) {
    if (this.has(extId)) {
      log(`Removing "${extId}" extension from /quasar.extensions.json ...`)
      delete this.extensions[extId]
      this.__save()
    }
  }

  get (extId: string) {
    return this.extensions[extId] || {}
  }

  getPrompts (extId: string) {
    const { __internal, ...prompts } = this.get(extId)
    return prompts
  }

  getInternal (extId: string) {
    const cfg = this.get(extId)
    return cfg.__internal || {}
  }

  has (extId: string) {
    return this.extensions[extId] !== void 0
  }

  __save () {
    fs.writeFileSync(
      this.extensionPath,
      JSON.stringify(this.extensions, null, 2),
      'utf-8'
    )
  }
}

export default ExtensionJson
