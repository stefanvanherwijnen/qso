<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
<div class="column items-center">
  <q-card class="col-3 my-card">
    <img src="https://cdn.quasar.dev/img/mountains.jpg">

    <q-card-section>
      <div class="text-h6">Quasar 2</div>
      <div class="text-subtitle2">Vite</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      {{ msg }}
    </q-card-section>
  </q-card>

  <q-card class="my-card text-center">
    <q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
      <div class="absolute-bottom text-subtitle2 text-center">
        Title
      </div>
    </q-img>
  </q-card>
</div>

</template>

<style coped>
.my-card {
  width: 100%;
  max-width: 250px
}
</style>
