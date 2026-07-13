import { v4 as uuidv4 } from 'uuid'

export interface App {
  id: string
  name: string
  description: string
  url: string
  screenshot: string
  createdAt: string
  updatedAt: string
}

export interface AppsData {
  apps: App[]
}

export function createApp(
  data: Omit<App, 'id' | 'createdAt' | 'updatedAt'>,
): App {
  const now = new Date().toISOString()
  return {
    id: uuidv4(),
    ...data,
    createdAt: now,
    updatedAt: now,
  }
}
