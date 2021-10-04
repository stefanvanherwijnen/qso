import extensionRunner from '@stefanvh/quasar-app-vite/lib/app-extension/extensions-runner'
import { log } from '@stefanvh/quasar-app-vite/lib/helpers/logger'
import { VitePWAOptions } from 'vite-plugin-pwa'
export interface QuasarConf {
  boot: [],
  extras: [],
  pwa: VitePWAOptions,
}

export const quasarConf = async function (ctx: any) {
  // @ts-ignore
  const QuasarConf = await import('quasarConf')
  let cfg: QuasarConf
  if (typeof QuasarConf === "function") {
    cfg = QuasarConf(ctx)
  } else {
    cfg = QuasarConf
  }

  // await extensionRunner.runHook('extendQuasarConf', async (hook: any) => {
  //   log(`Extension(${hook.api.extId}): Extending quasar.conf...`)
  //   await hook.fn(cfg, hook.api)
  // })

  return cfg
}