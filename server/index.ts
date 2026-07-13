import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import appsRouter from './routes/apps.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
app.use('/api/apps', appsRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
