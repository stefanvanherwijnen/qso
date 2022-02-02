import { UserConfig } from 'vite'

import { VitePWAOptions } from 'vite-plugin-pwa'

import merge from 'merge-deep'
import { FastifyInstance } from 'fastify'
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
  pwa?: VitePWAOptions,
  /** Vite config is merged using a plugin */
  vite?: UserConfig,
  fastify?: {
    /** setup() is called directly after instantiating fastify. Use it to register your own plugins, routes etc. */
    setup: (fastify: FastifyInstance) => any
  },
  sassVariables: Record<string, string>,
  appExtensions: Record<string, any>
}

export const prepareQuasarConf = (conf?: Partial<QuasarConf>) => {
  return merge({
    /** Legacy support */
    build: {
      transpileDependencies: [],
      vueLoaderOptions: {
        compilerOptions: {},
        transformAssetUrls: {}
      },
      sassLoaderOptions: {},
      scssLoaderOptions: {},
      stylusLoaderOptions: {},
      lessLoaderOptions: {},
      env: {},
      uglifyOptions: {
        compress: {},
        mangle: {}
      }
    },
    css: [],
    boot: [],
    framework: {
      components: [],
      directives: [],
      plugins: []
    },
    animations: [],
    extras: [],
    vite: {
      resolve: {
        alias: []
      }
    }
  },
  conf) as QuasarConf
}