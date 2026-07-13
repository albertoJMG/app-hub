import { ref } from 'vue'
import type { App } from '../types/app.ts'

const apps = ref<App[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const API = '/api/apps'

export function useApps() {
  async function fetchApps() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error('Failed to fetch apps')
      apps.value = await res.json()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function addApp(data: Omit<App, 'id' | 'createdAt' | 'updatedAt'>) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to add app')
    const app = await res.json()
    apps.value.push(app)
    return app
  }

  async function updateApp(id: string, data: Partial<App>) {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update app')
    const updated = await res.json()
    const index = apps.value.findIndex((a) => a.id === id)
    if (index !== -1) apps.value[index] = updated
    return updated
  }

  async function deleteApp(id: string) {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete app')
    apps.value = apps.value.filter((a) => a.id !== id)
  }

  async function uploadScreenshot(file: File) {
    const formData = new FormData()
    formData.append('screenshot', file)
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) throw new Error('Failed to upload screenshot')
    return (await res.json()) as { url: string }
  }

  return { apps, loading, error, fetchApps, addApp, updateApp, deleteApp, uploadScreenshot }
}
