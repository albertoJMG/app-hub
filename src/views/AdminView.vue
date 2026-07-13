<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div class="flex items-center gap-3">
          <router-link
            to="/"
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <ArrowLeft class="h-4 w-4" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">Panel de administración</h1>
        </div>
        <button
          class="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          @click="openModal(null)"
        >
          <Plus class="h-4 w-4" />
          <span class="hidden sm:inline">Añadir app</span>
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div v-if="loading" class="flex justify-center py-20">
        <Loader2 class="h-8 w-8 animate-spin text-indigo-600" />
      </div>

      <EmptyState
        v-else-if="apps.length === 0"
        title="Sin aplicaciones"
        description="Añade tu primera aplicación para comenzar a gestionar tu hub."
      >
        <button
          class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          @click="openModal(null)"
        >
          <Plus class="h-4 w-4" />
          Añadir aplicación
        </button>
      </EmptyState>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AppCard
          v-for="app in apps"
          :key="app.id"
          :app="app"
          :show-actions="true"
          @edit="openModal(app)"
          @delete="confirmDelete(app)"
        />
      </div>
    </main>

    <AppModal
      :show="modalOpen"
      :edit-app="editingApp"
      :on-submit="handleSubmit"
      @close="modalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, Plus, Loader2 } from '@lucide/vue'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import EmptyState from '../components/EmptyState.vue'
import { useApps } from '../composables/useApps.ts'
import type { App } from '../types/app.ts'

const { apps, loading, fetchApps, addApp, updateApp, deleteApp, uploadScreenshot } = useApps()

const modalOpen = ref(false)
const editingApp = ref<App | null>(null)

function openModal(app: App | null) {
  editingApp.value = app
  modalOpen.value = true
}

async function handleSubmit(data: Omit<App, 'id' | 'createdAt' | 'updatedAt'>, file?: File) {
  let screenshot = data.screenshot
  if (file) {
    const result = await uploadScreenshot(file)
    screenshot = result.url
  }

  if (editingApp.value) {
    await updateApp(editingApp.value.id, { ...data, screenshot })
  } else {
    await addApp({ ...data, screenshot })
  }
  modalOpen.value = false
}

function confirmDelete(app: App) {
  if (window.confirm(`¿Eliminar "${app.name}"? Esta acción no se puede deshacer.`)) {
    deleteApp(app.id)
  }
}

onMounted(fetchApps)
</script>
