import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { green } from 'chalk'
import { Plugin, UserConfig } from 'vite'

import { AppPaths, getAppPaths } from '@stefanvh/quasar-app-vite/app-paths'
import { log, warn, fatal, error } from '@stefanvh/quasar-app-vite/helpers/logger'
import { VitePWAOptions } from 'vite-plugin-pwa'

import merge from 'merge-deep'
import { FastifyInstance } from 'fastify'
export interface QuasarConf {
  ctx: Record<string, any>
  css: string[],
  boot: string[],
  framework: {
    config: Record<string, any>
    components: string[],
    directives: string[],
    plugins: string[]
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
  }
}

class QuasarConfFile {
  ctx: Record<string, any>
  opts: Record<string, any>
  filename: string
  pkg: Record<string, any>
  quasarConf: Record<string, any>
  constructor(ctx: Record<string, any>, appPaths: AppPaths, opts = {}) {
    this.ctx = ctx
    this.opts = opts
    this.filename = appPaths.resolve.app('quasar.conf.js')
    this.pkg = JSON.parse(readFileSync(appPaths.resolve.app('package.json'), 'utf-8'))
    this.quasarConf = this.prepare()
  }

  async get () {
    if (!!this.quasarConf && typeof this.quasarConf.then === 'function') {
      this.quasarConf = await this.quasarConf
    }
    return this.quasarConf as QuasarConf
  }

  async prepare () {
    let quasarConfigFunction

    if (existsSync(this.filename)) {
      quasarConfigFunction = (await import(this.filename)).default
    }
    else {
      fatal('Could not load quasar.conf.js config file', 'FAIL')
    }

    const initialConf = await quasarConfigFunction(this.ctx)

    const cfg = merge({
      ctx: this.ctx,
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
      initialConf
    ) as QuasarConf

    // if (cfg.animations === 'all') {
    //   cfg.animations = require('./helpers/animations')
    // }

    // if (!cfg.framework.plugins) {
    //   cfg.framework.plugins = []
    // }
    // if (!cfg.framework.config) {
    //   cfg.framework.config = {}
    // }

    return cfg
  }

}

export default QuasarConfFile
