<template>
  <div
    class="group relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-800"
    :class="showActions ? '' : 'cursor-pointer'"
    @click="showActions ? undefined : $emit('open', app)"
  >
    <div class="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
      <img
        v-if="app.screenshot"
        :src="app.screenshot"
        :alt="app.name"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div v-else class="flex h-full items-center justify-center">
        <LayoutGrid class="h-12 w-12 text-gray-300 dark:text-gray-500" />
      </div>
    </div>

    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
        {{ app.name }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
        {{ app.description }}
      </p>
    </div>

    <div
      v-if="showActions"
      class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <button
        class="rounded-lg bg-white/90 p-1.5 text-gray-600 hover:bg-white hover:text-indigo-600 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 shadow-sm"
        @click.stop="$emit('edit', app)"
      >
        <Pencil class="h-4 w-4" />
      </button>
      <button
        class="rounded-lg bg-white/90 p-1.5 text-gray-600 hover:bg-white hover:text-red-600 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-red-400 shadow-sm"
        @click.stop="$emit('delete', app)"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>


  </div>
</template>

<script setup lang="ts">
import { LayoutGrid, Pencil, Trash2 } from '@lucide/vue'
import type { App } from '../types/app.ts'

defineProps<{
  app: App
  showActions?: boolean
}>()

defineEmits<{
  edit: [app: App]
  delete: [app: App]
  open: [app: App]
}>()
</script>
