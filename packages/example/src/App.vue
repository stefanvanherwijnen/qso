<template>
  <div>
    <q-btn label="About" icon="person" to="/about"></q-btn>
    <q-btn label="Login" to="/login"></q-btn>
    <q-btn label="QCalendar" to="/qcalendar"></q-btn>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, getCurrentInstance } from 'vue'
import { useQuasar } from 'quasar'
export default defineComponent({
  components: {
  },
  setup() {
    const $q = useQuasar()
    $q.notify({
      message: 'Test'
    })
    return {

    }
  },
})
</script>

<style lang="sass">
// do not remove, required for additionalData import
</style>
