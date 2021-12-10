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
import { useQuasar } from 'quasar'
// import Dialog from 'quasar/src/plugins/Dialog.js'
export default defineComponent({
  components: {
  },
  setup() {
    const $q = useQuasar()
    setTimeout(() => {
    $q.dialog({
      message: 'Test'
    })
    }, 1000)

    return {

    }
  },
})
</script>

<style lang="sass">
// do not remove, required for additionalData import
</style>
