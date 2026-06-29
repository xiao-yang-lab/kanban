import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { fileURLToPath } from 'url'
import path from 'path'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbFile = path.join(__dirname, 'db.json')

// 默认数据结构
const defaultData = {
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

const adapter = new JSONFile(dbFile)
const db = new Low(adapter, defaultData)

export async function initDB() {
  await db.read()
  // 如果文件不存在或为空，写入默认数据
  if (!db.data) {
    db.data = JSON.parse(JSON.stringify(defaultData))
    await db.write()
  }
}

export function getDB() {
  return db
}

export function generateId() {
  return crypto.randomUUID()
}
