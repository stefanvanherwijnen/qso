<template>
  <div>
    <q-btn label="About" to="/about"></q-btn>
    <q-btn label="Login" to="/login"></q-btn>
    <q-btn label="QCalendar" to="/qcalendar"></q-btn>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, getCurrentInstance } from 'vue'
// import Dialog from 'quasar/src/plugins/Dialog.js'
export default defineComponent({
  components: {
  },
  setup() {
    const vm = getCurrentInstance()
    console.log(vm)

    return {

    }
  },
})
</script>

<style lang="sass">
// do not remove, required for additionalData import
</style>
