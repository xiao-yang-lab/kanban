import axios from 'axios'
import router from '@/router'

const http = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器：自动注入 JWT token
http.interceptors.request.use(config => {
  const token = localStorage.getItem('kanban-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：401 统一处理
http.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kanban-token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default http

// ===== Auth API =====
export const authAPI = {
  login(data) { return http.post('/auth/login', data) },
  register(data) { return http.post('/auth/register', data) },
  me() { return http.get('/auth/me') }
}

// ===== Tasks API =====
export const tasksAPI = {
  getAll(params) { return http.get('/tasks', { params }) },
  create(data) { return http.post('/tasks', data) },
  update(id, data) { return http.patch(`/tasks/${id}`, data) },
  delete(id) { return http.delete(`/tasks/${id}`) },
  importTasks(tasks) { return http.post('/tasks/import', { tasks }) },
  exportTasks() { return http.get('/tasks/export') }
}
