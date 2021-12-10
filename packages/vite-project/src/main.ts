import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { Quasar } from 'quasar'
import plugins from 'virtual:quasar-plugins'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import('./pages/Home.vue')}
  ]
})

const app = createApp(App)

app.use(router)

app.use(Quasar, {
  plugins
})
app.mount('#app')
