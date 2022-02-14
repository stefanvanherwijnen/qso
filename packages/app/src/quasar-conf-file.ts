import merge from 'merge-deep'
export interface QuasarConf {
  ctx: Record<string, any>
  css: string[],
  boot: string[],
  framework: {
    components?: string[],
    directives?: string[],
    plugins?: string[]
  },
  animations: string[],
  extras: string[],
  /** vite-plugin-pwa settings */
  // TODO: Implement PWA support or entirely move it to the vite plugin
  pwa?: boolean,
}

export const prepareQuasarConf = (conf?: Partial<QuasarConf>) => {
  return merge({
    /** Legacy support */
    css: [],
    boot: [],
    framework: {
      components: [],
      directives: [],
      plugins: []
    },
    animations: [],
    extras: [],
  },
    conf) as QuasarConf
}