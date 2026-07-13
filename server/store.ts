import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AppsData } from '../types.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, 'data', 'apps.json')

function readData(): AppsData {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw)
}

function writeData(data: AppsData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export function getAllApps() {
  return readData().apps
}

export function getAppById(id: string) {
  return readData().apps.find((app) => app.id === id)
}

export function addApp(app: AppsData['apps'][number]) {
  const data = readData()
  data.apps.push(app)
  writeData(data)
  return app
}

export function updateApp(id: string, updates: Partial<AppsData['apps'][number]>) {
  const data = readData()
  const index = data.apps.findIndex((app) => app.id === id)
  if (index === -1) return null
  data.apps[index] = { ...data.apps[index], ...updates, updatedAt: new Date().toISOString() }
  writeData(data)
  return data.apps[index]
}

export function deleteApp(id: string) {
  const data = readData()
  const index = data.apps.findIndex((app) => app.id === id)
  if (index === -1) return false
  data.apps.splice(index, 1)
  writeData(data)
  return true
}
