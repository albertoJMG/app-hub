<template>
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="rounded-full bg-gray-100 p-6 dark:bg-gray-800">
      <LayoutGrid class="h-12 w-12 text-gray-400 dark:text-gray-500" />
    </div>
    <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
      {{ title }}
    </h3>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
      {{ description }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { LayoutGrid } from '@lucide/vue'

defineProps<{
  title: string
  description: string
}>()
</script>
