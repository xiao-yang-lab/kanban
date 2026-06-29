import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tasksAPI } from '@/api'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  const todoTasks = computed(() =>
    tasks.value.filter(t => t.status === 'todo')
  )
  const inProgressTasks = computed(() =>
    tasks.value.filter(t => t.status === 'in-progress')
  )
  const doneTasks = computed(() =>
    tasks.value.filter(t => t.status === 'done')
  )

  async function fetchTasks(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await tasksAPI.getAll(params)
      tasks.value = res.data.tasks
    } catch (e) {
      error.value = e.response?.data?.error || '获取任务失败'
    } finally {
      loading.value = false
    }
  }

  async function createTask(data) {
    const res = await tasksAPI.create(data)
    tasks.value.unshift(res.data.task)
  }

  async function updateTask(id, data) {
    const res = await tasksAPI.update(id, data)
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      tasks.value[idx] = res.data.task
    }
  }

  async function deleteTask(id) {
    await tasksAPI.delete(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  async function moveTask(id, newStatus) {
    // 乐观更新
    const task = tasks.value.find(t => t.id === id)
    if (!task) return
    const oldStatus = task.status
    task.status = newStatus
    try {
      await tasksAPI.update(id, { status: newStatus })
    } catch {
      task.status = oldStatus
    }
  }

  async function exportTasks() {
    const res = await tasksAPI.exportTasks()
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kanban-tasks-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importTasks(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result)
          const tasksArray = data.tasks || data
          if (!Array.isArray(tasksArray)) throw new Error('格式错误')
          await tasksAPI.importTasks(tasksArray)
          await fetchTasks()
          resolve(tasksArray.length)
        } catch (err) {
          reject(err)
        }
      }
      reader.readAsText(file)
    })
  }

  return {
    tasks, loading, error,
    todoTasks, inProgressTasks, doneTasks,
    fetchTasks, createTask, updateTask, deleteTask,
    moveTask, exportTasks, importTasks
  }
})
