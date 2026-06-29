import { Router } from 'express'
import { getDB, generateId } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// 所有任务接口都需要认证
router.use(authMiddleware)

// GET /api/tasks - 获取所有任务（支持搜索和筛选）
router.get('/', (req, res) => {
  const db = getDB()
  let tasks = [...db.data.tasks]

  const { search, priority, status } = req.query

  // 搜索过滤
  if (search) {
    const q = search.toLowerCase()
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    )
  }

  // 优先级筛选
  if (priority) {
    tasks = tasks.filter(t => t.priority === priority)
  }

  // 状态筛选
  if (status) {
    tasks = tasks.filter(t => t.status === status)
  }

  // 按创建时间倒序
  tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.json({ tasks })
})

// POST /api/tasks - 创建任务
router.post('/', async (req, res) => {
  const { title, description, priority, dueDate } = req.body
  if (!title) {
    return res.status(400).json({ error: '任务标题不能为空' })
  }

  const db = getDB()
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

  db.data.tasks.push(task)
  await db.write()

  res.status(201).json({ task })
})

// PATCH /api/tasks/:id - 更新任务
router.patch('/:id', async (req, res) => {
  const db = getDB()
  const task = db.data.tasks.find(t => t.id === req.params.id)
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

  await db.write()

  res.json({ task })
})

// DELETE /api/tasks/:id - 删除任务
router.delete('/:id', async (req, res) => {
  const db = getDB()
  const index = db.data.tasks.findIndex(t => t.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: '任务不存在' })
  }

  db.data.tasks.splice(index, 1)
  await db.write()

  res.json({ success: true })
})

// POST /api/tasks/import - 批量导入任务
router.post('/import', async (req, res) => {
  const { tasks } = req.body
  if (!Array.isArray(tasks)) {
    return res.status(400).json({ error: '数据格式错误，需要 tasks 数组' })
  }

  const db = getDB()
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

  db.data.tasks.push(...imported)
  await db.write()

  res.json({ imported: imported.length, tasks: imported })
})

// GET /api/tasks/export - 导出所有任务为 JSON
router.get('/export', (req, res) => {
  const db = getDB()
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', 'attachment; filename=kanban-tasks.json')
  res.json({ tasks: db.data.tasks, exportedAt: new Date().toISOString() })
})

export default router
