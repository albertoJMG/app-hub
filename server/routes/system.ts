import { Router } from 'express'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const router = Router()

function readFileSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8').trim()
  } catch {
    return ''
  }
}

function getTemperature(): number | null {
  const raw = readFileSafe('/sys/class/thermal/thermal_zone0/temp')
  if (!raw) return null
  return Math.round(parseInt(raw, 10) / 100) / 10
}

function getMemory() {
  const raw = readFileSafe('/proc/meminfo')
  if (!raw) return null
  const lines = Object.fromEntries(
    raw.split('\n').map((line) => {
      const [key, ...rest] = line.split(':')
      const value = rest.join(':').trim().split(/\s+/)[0]
      return [key.trim(), parseInt(value, 10)]
    }),
  )
  const total = lines.MemTotal ?? 0
  const available = lines.MemAvailable ?? 0
  const used = total - available
  return {
    total: Math.round(total / 1024 / 1024 * 10) / 10,
    used: Math.round(used / 1024 / 1024 * 10) / 10,
    percent: Math.round((used / total) * 100),
  }
}

function getCpuLoad() {
  const raw = readFileSafe('/proc/loadavg')
  if (!raw) return null
  const [one, five, fifteen] = raw.split(/\s+/)
  return {
    '1m': parseFloat(one),
    '5m': parseFloat(five),
    '15m': parseFloat(fifteen),
  }
}

function getCpuInfo() {
  const raw = readFileSafe('/proc/cpuinfo')
  if (!raw) return null
  const modelMatch = raw.match(/Model\s*:\s*(.+)/i)
  const coresMatch = raw.match(/^processor\s*:/gm)
  return {
    model: modelMatch?.[1]?.trim() ?? 'Unknown',
    cores: coresMatch?.length ?? 0,
  }
}

function getDisk() {
  try {
    const stats = fs.statfsSync('/')
    const total = stats.blocks * stats.bsize
    const free = stats.bfree * stats.bsize
    const used = total - free
    return {
      total: Math.round((total / 1073741824) * 10) / 10,
      used: Math.round((used / 1073741824) * 10) / 10,
      percent: Math.round((used / total) * 100),
    }
  } catch {
    return null
  }
}

function getUptime() {
  const raw = readFileSafe('/proc/uptime')
  if (!raw) return null
  const seconds = parseInt(raw.split(/\s+/)[0], 10)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  parts.push(`${minutes}m`)
  return parts.join(' ')
}

function getOsInfo() {
  const raw = readFileSafe('/etc/os-release')
  if (!raw) return os.type()
  const data = Object.fromEntries(
    raw.split('\n').map((line) => {
      const [key, ...rest] = line.split('=')
      return [key.trim(), rest.join('=').replace(/"/g, '').trim()]
    }),
  )
  return `${data.PRETTY_NAME ?? os.type()}`
}

function getIpAddress(): string {
  const interfaces = os.networkInterfaces()
  for (const name of ['eth0', 'wlan0', 'enp0s3']) {
    const nets = interfaces[name]
    if (!nets) continue
    const ipv4 = nets.find((n) => n.family === 'IPv4' && !n.internal)
    if (ipv4) return ipv4.address
  }
  for (const nets of Object.values(interfaces)) {
    if (!nets) continue
    const ipv4 = nets.find((n) => n.family === 'IPv4' && !n.internal)
    if (ipv4) return ipv4.address
  }
  return '127.0.0.1'
}

router.get('/', (_req, res) => {
  res.json({
    temperature: getTemperature(),
    memory: getMemory(),
    cpuLoad: getCpuLoad(),
    cpuInfo: getCpuInfo(),
    disk: getDisk(),
    uptime: getUptime(),
    os: getOsInfo(),
    hostname: os.hostname(),
    ip: getIpAddress(),
  })
})

export default router
