<template>
  <q-card>
    <q-card-section>
      Home
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useQuery } from '@urql/vue'

const result = useQuery({
  query: `
    {
      todos {
        id
        title
      }
    }
  `
})

</script>

