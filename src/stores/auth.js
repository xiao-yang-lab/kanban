import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('kanban-token') || '')
  const user = ref(null)
  const isLoggedIn = computed(() => !!token.value)

  async function login(username, password) {
    const res = await authAPI.login({ username, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('kanban-token', res.data.token)
    return res.data
  }

  async function register(username, password) {
    const res = await authAPI.register({ username, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('kanban-token', res.data.token)
    return res.data
  }

  async function fetchUser() {
    try {
      const res = await authAPI.me()
      user.value = res.data.user
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('kanban-token')
  }

  return { token, user, isLoggedIn, login, register, fetchUser, logout }
})
