import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'

import routes from './routes'

export default function (/* { store, ssrContext } */) {
  const createHistory = import.meta.env.SERVER
    ? createMemoryHistory
    : import.meta.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: to => (to.meta && to.meta.skipScroll === true ? false : { x: 0, y: 0 }),
    routes,
    history: createHistory(import.meta.env.MODE === 'ssr' ? void 0 : import.meta.env.VUE_ROUTER_BASE)
  })

  return Router
}
