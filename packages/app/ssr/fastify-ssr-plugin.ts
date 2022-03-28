import { FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify'
import fastifyStatic from 'fastify-static'
import { readFileSync } from 'fs'
import { injectSsrContext } from '../src/helpers/ssr'

export interface FastifySsrOptions {
  baseUrl?: string,
  provide?: (req: FastifyRequest, res: FastifyReply) => Promise<Record<string, unknown>>
}

const fastifySsrPlugin: FastifyPluginCallback<FastifySsrOptions> = (fastify, options, done) => {
  options.baseUrl = options.baseUrl || '/'
  fastify.register(fastifyStatic, {
    root: new URL('../client', import.meta.url).pathname,
    wildcard: false,
    index: false,
    prefix: options.baseUrl
  })

  fastify.get(`${options.baseUrl}*`, async (req, res) => {
    const url = req.raw.url
    const provide = options.provide ? await options.provide(req, res) : {}
    let template
    let render
    let manifest
    const ssrContext: Record<string, any> = {
      req,
      res,
      provide
    }

    template = readFileSync(new URL('../client/index.html', import.meta.url).pathname).toString()
    manifest = JSON.parse(readFileSync(new URL('../client/ssr-manifest.json', import.meta.url)).toString())
    render = (await import(new URL('./entry-server.mjs', import.meta.url).pathname)).render

    const [appHtml, preloadLinks] = await render(url, manifest, ssrContext)

    if (!ssrContext.initialState) ssrContext.initialState = {}
    ssrContext.initialState.provide = provide

    let html = template
      .replace(`<!--preload-links-->`, preloadLinks)
      .replace(`<!--app-html-->`, appHtml)
    html = injectSsrContext(html, ssrContext)

    res.code(200)
    res.type('text/html')
    res.send(html)
  })

  done()

}

export {
  fastifySsrPlugin
}