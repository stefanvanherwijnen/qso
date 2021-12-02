import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { Quasar, Dialog } from 'quasar'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import('./pages/Home.vue')}
  ]
})

const app = createApp(App)

app.use(router)
app.use(Quasar, {
  plugins: {
    Dialog
  }
})
app.mount('#app')
