import express from 'express'
import cors from 'cors'
import { initDB } from './db.js'
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// 初始化数据库
await initDB()

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

app.listen(PORT, () => {
  console.log(`Kanban API Server → http://localhost:${PORT}`)
})

export default app
