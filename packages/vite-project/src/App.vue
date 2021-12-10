<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import HelloWorld from './components/HelloWorld.vue'
import { useQuasar } from 'quasar';

const $q = useQuasar()
setTimeout(() => {
$q.dialog({
  message: 'Test'
})
}, 1000)
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <q-card>
    <q-card-section>

    </q-card-section>
  </q-card>
  <!-- <HelloWorld msg="Hello Quasar 2 + TypeScript + Vite" /> -->
</template>

<style lang="sass">
// required
</style>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
