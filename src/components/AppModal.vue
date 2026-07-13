<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')" />

      <div
        class="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ editApp ? 'Editar aplicación' : 'Nueva aplicación' }}
          </h2>
          <button
            class="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700"
            @click="$emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              placeholder="Mi aplicación"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 resize-none"
              placeholder="Breve descripción de la aplicación..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL *
            </label>
            <input
              v-model="form.url"
              type="url"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              placeholder="https://mi-app.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Screenshot
            </label>
            <div
              class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-indigo-400 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-indigo-500"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <img
                v-if="previewUrl"
                :src="previewUrl"
                class="mb-3 h-32 rounded-lg object-cover"
              />
              <template v-else>
                <Upload class="mb-2 h-8 w-8 text-gray-400" />
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Arrastra una imagen o
                  <label class="cursor-pointer text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    selecciona un archivo
                    <input type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
                  </label>
                </p>
              </template>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="$emit('close')"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Guardando...' : (editApp ? 'Guardar cambios' : 'Crear aplicación') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Upload } from '@lucide/vue'
import type { App } from '../types/app.ts'

const props = defineProps<{
  show: boolean
  editApp: App | null
  onSubmit: (data: Omit<App, 'id' | 'createdAt' | 'updatedAt'>, file?: File) => Promise<void>
}>()

defineEmits<{
  close: []
}>()

const submitting = ref(false)
const form = ref({ name: '', description: '', url: '', screenshot: '' })
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')

watch(
  () => props.editApp,
  (app) => {
    if (app) {
      form.value = {
        name: app.name,
        description: app.description,
        url: app.url,
        screenshot: app.screenshot,
      }
      previewUrl.value = app.screenshot
    } else {
      form.value = { name: '', description: '', url: '', screenshot: '' }
      previewUrl.value = ''
    }
    selectedFile.value = null
  },
)

watch(
  () => props.show,
  (visible) => {
    if (!visible) {
      form.value = { name: '', description: '', url: '', screenshot: '' }
      previewUrl.value = ''
      selectedFile.value = null
    }
  },
)

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) setSelectedFile(file)
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) setSelectedFile(file)
}

function setSelectedFile(file: File) {
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function handleSubmit() {
  submitting.value = true
  try {
    await props.onSubmit(
      {
        name: form.value.name,
        description: form.value.description,
        url: form.value.url,
        screenshot: form.value.screenshot,
      },
      selectedFile.value ?? undefined,
    )
  } finally {
    submitting.value = false
  }
}
</script>
