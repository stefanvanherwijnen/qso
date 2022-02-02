import { QuasarConf } from "../quasar-conf-file"

export const IndexAPI = (ctx: Record<string, unknown>, quasarConf: QuasarConf) => new Proxy({
    ctx,
    getPersistentConf: () => {},
    setPersistentConf (cfg: Record<string, any>) {},
    mergePersistentConf (cfg = {}) {},
    async compatibleWith (packageName: string, semverCondition: string) {},
    async hasPackage (packageName: string, semverCondition: string) {},
    hasExtension (extId: string) {},
    async getPackageVersion (packageName: string) {},
    extendQuasarConf (fn: (cfg: Record<string, any>, ctx: Record<string, any>) => void) {
      fn(quasarConf as Record<string, any>, ctx)
    },
    registerCommand (commandName: string, fn: ({ args, params }: { args: string[], params: Record<string, any> }) => Promise<any>) {},
    registerDescribeApi (name: string, relativePath: string) {},
    beforeDev (fn: (api: any, { quasarConf }: { quasarConf: Record<string, any> }) => Promise<any>) {},
    afterDev (fn: (api: any, { quasarConf }: { quasarConf: Record<string, any> }) => Promise<any>) {},
    beforeBuild (fn: (api: any, { quasarConf }: { quasarConf: Record<string, any> }) => Promise<any>) {},
    afterBuild (fn: (api: any, { quasarConf }: { quasarConf: Record<string, any> }) => Promise<any>) {},
  } as Record<string, any>, {
  get: function(target, key) {
    return key in target ? target[key as keyof typeof target] : () => `${key as string} is not supported`;
  }
})