import extensionJson from '@stefanvh/quasar-app-vite/lib/app-extension/extension-json'
import Extension from '@stefanvh/quasar-app-vite/lib/app-extension/Extenson'
class ExtensionsRunner {
  hooks: Record<string, any>
  extensions: Extension[]
  constructor () {
    const list = extensionJson.getList()

    this.hooks = {}
    this.extensions = Object.keys(list).map(ext => new Extension(ext))
  }

  async registerExtensions (ctx: Record<string, any>) {
    this.hooks = {}
    for (let ext of this.extensions) {
      const hooks = await ext.run(ctx)
    //   this.hooks = merge({}, this.hooks, hooks)
      this.hooks = Object.assign({}, this.hooks, hooks)
    }
  }

  async runHook (hookName: string, fn: (hook: string) => void) {
    if (this.hooks[hookName] && this.hooks[hookName].length > 0) {
      for (let hook of this.hooks[hookName]) {
        await fn(hook)
      }
    }
  }
}

export default new ExtensionsRunner()
