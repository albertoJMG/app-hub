import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from '../types.ts'
import { getAllApps, addApp, updateApp, deleteApp } from '../store.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(__dirname, '..', 'uploads', 'screenshots')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, allowed.includes(ext))
  },
})

const router = Router()

router.get('/', (_req, res) => {
  res.json(getAllApps())
})

router.post('/', (req, res) => {
  const { name, description, url, screenshot } = req.body
  if (!name || !url) {
    res.status(400).json({ error: 'name and url are required' })
    return
  }
  const app = createApp({ name, description: description || '', url, screenshot: screenshot || '' })
  res.status(201).json(addApp(app))
})

router.put('/:id', (req, res) => {
  const updated = updateApp(req.params.id, req.body)
  if (!updated) {
    res.status(404).json({ error: 'App not found' })
    return
  }
  res.json(updated)
})

router.delete('/:id', (req, res) => {
  const deleted = deleteApp(req.params.id)
  if (!deleted) {
    res.status(404).json({ error: 'App not found' })
    return
  }
  res.status(204).send()
})

router.post('/upload', upload.single('screenshot'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' })
    return
  }
  const url = `/uploads/screenshots/${req.file.filename}`
  res.json({ url })
})

export default router
