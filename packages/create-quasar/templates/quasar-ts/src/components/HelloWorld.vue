<template>
  {{ count }}
  Hello World
</template>

<script lang="ts" setup>
import { ref, defineProps } from 'vue'
defineProps<{ msg: string }>()
const count = ref(0)
</script>