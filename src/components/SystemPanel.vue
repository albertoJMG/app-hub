<template>
  <aside class="space-y-3">
    <h2 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      Sistema
    </h2>

    <div v-if="loading && !system" class="flex justify-center py-8">
      <Loader2 class="h-6 w-6 animate-spin text-indigo-600" />
    </div>

    <template v-else-if="system">
      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-2 mb-2">
          <Server class="h-4 w-4 text-indigo-500" />
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ system.hostname }}</span>
        </div>
        <p class="text-xs text-gray-400 dark:text-gray-500">{{ system.os }}</p>
        <p class="text-xs text-gray-400 dark:text-gray-500">{{ system.ip }}</p>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-2 mb-1">
          <Thermometer class="h-4 w-4" :class="tempColor" />
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Temperatura</span>
        </div>
        <p class="text-2xl font-bold" :class="tempColor">
          {{ system.temperature != null ? `${system.temperature}°C` : 'N/A' }}
        </p>
        <div v-if="system.cpuInfo" class="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {{ system.cpuInfo.model }} &middot; {{ system.cpuInfo.cores }} cores
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-2 mb-2">
          <MemoryStick class="h-4 w-4 text-blue-500" />
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Memoria RAM</span>
        </div>
        <template v-if="system.memory">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ system.memory.used }}<span class="text-sm font-normal text-gray-400"> / {{ system.memory.total }} GB</span>
          </p>
          <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="barColor(system.memory.percent)"
              :style="{ width: `${system.memory.percent}%` }"
            />
          </div>
          <p class="mt-1 text-right text-xs text-gray-400 dark:text-gray-500">{{ system.memory.percent }}%</p>
        </template>
        <p v-else class="text-sm text-gray-400">N/A</p>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-2 mb-2">
          <HardDrive class="h-4 w-4 text-emerald-500" />
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Disco</span>
        </div>
        <template v-if="system.disk">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ system.disk.used }}<span class="text-sm font-normal text-gray-400"> / {{ system.disk.total }} GB</span>
          </p>
          <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="barColor(system.disk.percent)"
              :style="{ width: `${system.disk.percent}%` }"
            />
          </div>
          <p class="mt-1 text-right text-xs text-gray-400 dark:text-gray-500">{{ system.disk.percent }}%</p>
        </template>
        <p v-else class="text-sm text-gray-400">N/A</p>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-2 mb-2">
          <Cpu class="h-4 w-4 text-amber-500" />
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">CPU Load</span>
        </div>
        <template v-if="system.cpuLoad">
          <div class="grid grid-cols-3 gap-2 text-center">
            <div>
              <p class="text-lg font-bold text-gray-900 dark:text-white">{{ system.cpuLoad['1m'].toFixed(2) }}</p>
              <p class="text-[10px] text-gray-400">1 min</p>
            </div>
            <div>
              <p class="text-lg font-bold text-gray-900 dark:text-white">{{ system.cpuLoad['5m'].toFixed(2) }}</p>
              <p class="text-[10px] text-gray-400">5 min</p>
            </div>
            <div>
              <p class="text-lg font-bold text-gray-900 dark:text-white">{{ system.cpuLoad['15m'].toFixed(2) }}</p>
              <p class="text-[10px] text-gray-400">15 min</p>
            </div>
          </div>
        </template>
        <p v-else class="text-sm text-gray-400">N/A</p>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-2">
          <Clock class="h-4 w-4 text-purple-500" />
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Uptime</span>
        </div>
        <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">
          {{ system.uptime ?? 'N/A' }}
        </p>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Server, Thermometer, MemoryStick, HardDrive, Cpu, Clock, Loader2 } from '@lucide/vue'
import { useSystem } from '../composables/useSystem.ts'

const { system, loading } = useSystem()

const tempColor = computed(() => {
  const t = system.value?.temperature
  if (t == null) return 'text-gray-400'
  if (t < 50) return 'text-emerald-500'
  if (t < 65) return 'text-amber-500'
  return 'text-red-500'
})

function barColor(percent: number): string {
  if (percent < 60) return 'bg-emerald-500'
  if (percent < 85) return 'bg-amber-500'
  return 'bg-red-500'
}
</script>
