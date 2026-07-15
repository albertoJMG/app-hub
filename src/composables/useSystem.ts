import { ref, onMounted, onUnmounted } from 'vue'

export interface SystemInfo {
  temperature: number | null
  memory: {
    total: number
    used: number
    percent: number
  } | null
  cpuLoad: {
    '1m': number
    '5m': number
    '15m': number
  } | null
  cpuInfo: {
    model: string
    cores: number
  } | null
  disk: {
    total: number
    used: number
    percent: number
  } | null
  uptime: string | null
  os: string
  hostname: string
  ip: string
}

const system = ref<SystemInfo | null>(null)
const loading = ref(true)
let interval: ReturnType<typeof setInterval> | null = null

async function fetchSystem() {
  try {
    const res = await fetch('/api/system')
    if (res.ok) {
      system.value = await res.json()
    }
  } catch {
    // keep previous value
  } finally {
    loading.value = false
  }
}

export function useSystem() {
  onMounted(() => {
    fetchSystem()
    interval = setInterval(fetchSystem, 5000)
  })

  onUnmounted(() => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  })

  return { system, loading }
}
