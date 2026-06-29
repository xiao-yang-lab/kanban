import { Router } from 'express'
import { getDB, generateId } from '../db.js'
import { signToken, authMiddleware } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/register - 用户注册
router.post('/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度不能少于6位' })
  }

  const db = getDB()
  const existing = db.data.users.find(u => u.username === username)
  if (existing) {
    return res.status(409).json({ error: '用户名已存在' })
  }

  const user = {
    id: generateId(),
    username,
    password,
    createdAt: new Date().toISOString()
  }
  db.data.users.push(user)
  await db.write()

  const token = signToken({ id: user.id, username: user.username })
  res.json({ token, user: { id: user.id, username: user.username } })
})

// POST /api/auth/login - 用户登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }

  const db = getDB()
  const user = db.data.users.find(u => u.username === username && u.password === password)
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const token = signToken({ id: user.id, username: user.username })
  res.json({ token, user: { id: user.id, username: user.username } })
})

// GET /api/auth/me - 获取当前用户信息
router.get('/me', authMiddleware, (req, res) => {
  const db = getDB()
  const user = db.data.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }
  res.json({ user: { id: user.id, username: user.username } })
})

export default router
