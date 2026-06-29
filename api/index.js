import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const app = express()
app.use(cors())
app.use(express.json())

const JWT_SECRET = 'kanban-app-secret-key-2026'
const JWT_EXPIRES = '7d'

// ===== In-memory database =====
const db = {
  users: [
    {
      id: '1',
      username: 'admin',
      password: 'admin123',
      createdAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: '1',
      title: '设计系统首页原型',
      description: '使用 Figma 完成首页设计稿，包含导航栏、Hero 区域和功能卡片展示',
      status: 'done',
      priority: 'high',
      dueDate: '2026-07-01',
      createdAt: '2026-06-20T08:00:00.000Z',
      updatedAt: '2026-06-25T10:30:00.000Z'
    },
    {
      id: '2',
      title: '搭建 Express 后端框架',
      description: '初始化 Node.js 项目，配置 Express + lowdb + JWT 认证中间件',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2026-07-05',
      createdAt: '2026-06-22T09:00:00.000Z',
      updatedAt: '2026-06-28T14:00:00.000Z'
    },
    {
      id: '3',
      title: '实现任务拖拽功能',
      description: '集成 vuedraggable 组件，支持任务在不同状态列之间拖拽移动并同步后端',
      status: 'todo',
      priority: 'medium',
      dueDate: '2026-07-10',
      createdAt: '2026-06-24T11:00:00.000Z',
      updatedAt: '2026-06-24T11:00:00.000Z'
    },
    {
      id: '4',
      title: '编写单元测试',
      description: '使用 Vitest 为 Pinia Store 和核心组件编写单元测试用例，覆盖主要业务流程',
      status: 'todo',
      priority: 'low',
      dueDate: '2026-07-15',
      createdAt: '2026-06-26T16:00:00.000Z',
      updatedAt: '2026-06-26T16:00:00.000Z'
    },
    {
      id: '5',
      title: '响应式布局适配',
      description: '适配移动端（≤768px）布局：单列看板、底部导航、触控友好的拖拽操作',
      status: 'todo',
      priority: 'medium',
      dueDate: '2026-07-12',
      createdAt: '2026-06-27T13:00:00.000Z',
      updatedAt: '2026-06-27T13:00:00.000Z'
    }
  ]
}

function generateId() {
  return crypto.randomUUID()
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录，请先登录' })
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}

// ===== Auth Routes =====
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度不能少于6位' })
  }

  const existing = db.users.find(u => u.username === username)
  if (existing) {
    return res.status(409).json({ error: '用户名已存在' })
  }

  const user = {
    id: generateId(),
    username,
    password,
    createdAt: new Date().toISOString()
  }
  db.users.push(user)

  const token = signToken({ id: user.id, username: user.username })
  res.json({ token, user: { id: user.id, username: user.username } })
})

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }

  const user = db.users.find(u => u.username === username && u.password === password)
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const token = signToken({ id: user.id, username: user.username })
  res.json({ token, user: { id: user.id, username: user.username } })
})

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }
  res.json({ user: { id: user.id, username: user.username } })
})

// ===== Task Routes =====
app.use('/api/tasks', authMiddleware)

app.get('/api/tasks', (req, res) => {
  let tasks = [...db.tasks]

  const { search, priority, status } = req.query

  if (search) {
    const q = search.toLowerCase()
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    )
  }

  if (priority) {
    tasks = tasks.filter(t => t.priority === priority)
  }

  if (status) {
    tasks = tasks.filter(t => t.status === status)
  }

  tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ tasks })
})

app.get('/api/tasks/export', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', 'attachment; filename=kanban-tasks.json')
  res.json({ tasks: db.tasks, exportedAt: new Date().toISOString() })
})

app.get('/api/tasks/:id', (req, res) => {
  const task = db.tasks.find(t => t.id === req.params.id)
  if (!task) {
    return res.status(404).json({ error: '任务不存在' })
  }
  res.json({ task })
})

app.post('/api/tasks', (req, res) => {
  const { title, description, priority, dueDate } = req.body
  if (!title) {
    return res.status(400).json({ error: '任务标题不能为空' })
  }

  const now = new Date().toISOString()
  const task = {
    id: generateId(),
    title,
    description: description || '',
    status: 'todo',
    priority: priority || 'medium',
    dueDate: dueDate || '',
    createdAt: now,
    updatedAt: now
  }

  db.tasks.push(task)
  res.status(201).json({ task })
})

app.post('/api/tasks/import', (req, res) => {
  const { tasks } = req.body
  if (!Array.isArray(tasks)) {
    return res.status(400).json({ error: '数据格式错误，需要 tasks 数组' })
  }

  const now = new Date().toISOString()
  const imported = tasks.map(t => ({
    id: generateId(),
    title: t.title || '未命名任务',
    description: t.description || '',
    status: t.status || 'todo',
    priority: t.priority || 'medium',
    dueDate: t.dueDate || '',
    createdAt: now,
    updatedAt: now
  }))

  db.tasks.push(...imported)
  res.json({ imported: imported.length, tasks: imported })
})

app.patch('/api/tasks/:id', (req, res) => {
  const task = db.tasks.find(t => t.id === req.params.id)
  if (!task) {
    return res.status(404).json({ error: '任务不存在' })
  }

  const { title, description, status, priority, dueDate } = req.body
  if (title !== undefined) task.title = title
  if (description !== undefined) task.description = description
  if (status !== undefined) task.status = status
  if (priority !== undefined) task.priority = priority
  if (dueDate !== undefined) task.dueDate = dueDate
  task.updatedAt = new Date().toISOString()

  res.json({ task })
})

app.delete('/api/tasks/:id', (req, res) => {
  const index = db.tasks.findIndex(t => t.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: '任务不存在' })
  }

  db.tasks.splice(index, 1)
  res.json({ success: true })
})

export default app
