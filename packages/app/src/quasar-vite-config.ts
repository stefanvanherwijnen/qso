import { FastifyInstance } from "fastify";
import { UserConfig } from "vite";
import { QuasarConf } from "./quasar-conf-file";

export interface QuasarViteConfig extends UserConfig {
  quasar: {
    conf: QuasarConf,
    sassVariables?: Record<string, string>
    fastify?: {
      /** setup() is called directly after instantiating fastify. Use it to register your own plugins, routes etc. */
      setup: (fastify: FastifyInstance) => any
    }
  }
}

export const defineConfig = (config: QuasarViteConfig) => config