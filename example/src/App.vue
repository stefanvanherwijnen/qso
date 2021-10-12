<template>
  <div>
    <q-btn label="About" to="/about"></q-btn>
    <q-btn label="Login" to="/login"></q-btn>
    <q-btn label="QCalendar" to="/qcalendar"></q-btn>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
// import Dialog from 'quasar/src/plugins/Dialog.js'
export default defineComponent({
  components: {
  },
  setup() {
    if (import.meta.env.MODE === 'production' && typeof window !== 'undefined') {
      onMounted(async() => {
        // const { registerSW } = await import('virtual:pwa-register');
        // registerSW({ immediate: true });

        // Dialog.create({
        //   message: "Welcome"
        // })
      });
    }
    
    if (!import.meta.env.SSR) {

    }

    return {

    }
  },
})
</script>

<style lang="sass">
// do not remove, required for additionalData import
</style>
