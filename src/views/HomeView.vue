<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            H
          </div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">App Hub</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar aplicaciones..."
              class="w-48 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:w-64 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <router-link
            to="/admin"
            class="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Settings class="h-4 w-4" />
            <span class="hidden sm:inline">Admin</span>
          </router-link>
        </div>
      </div>
    </header>

    <main class="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6">
      <div class="min-w-0 flex-1">
        <div v-if="loading" class="flex justify-center py-20">
          <Loader2 class="h-8 w-8 animate-spin text-indigo-600" />
        </div>

        <EmptyState
          v-else-if="filteredApps.length === 0 && !search"
          title="No hay aplicaciones"
          description="Aún no se han añadido aplicaciones al hub. Ve al panel de administración para añadir la primera."
        >
          <router-link
            to="/admin"
            class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus class="h-4 w-4" />
            Añadir aplicación
          </router-link>
        </EmptyState>

        <EmptyState
          v-else-if="filteredApps.length === 0 && search"
          title="Sin resultados"
          :description="`No se encontraron aplicaciones para '${search}'`"
        />

        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AppCard
            v-for="app in filteredApps"
            :key="app.id"
            :app="app"
            @open="openApp"
          />
        </div>
      </div>

      <div class="hidden w-72 shrink-0 lg:block">
        <div class="sticky top-24">
          <SystemPanel />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Settings, Plus, Loader2 } from '@lucide/vue'
import AppCard from '../components/AppCard.vue'
import EmptyState from '../components/EmptyState.vue'
import SystemPanel from '../components/SystemPanel.vue'
import { useApps } from '../composables/useApps.ts'
import type { App } from '../types/app.ts'

const { apps, loading, fetchApps } = useApps()
const search = ref('')

function openApp(app: App) {
  window.open(app.url, '_blank', 'noopener,noreferrer')
}

const filteredApps = computed(() => {
  if (!search.value) return apps.value
  const q = search.value.toLowerCase()
  return apps.value.filter(
    (app) =>
      app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q),
  )
})

onMounted(fetchApps)
</script>
