<template>
  <div class="login-page">
    <div class="login-card scale-in">
      <div class="login-header">
        <h1 class="login-title">Kanban</h1>
        <p class="login-subtitle">任务管理面板</p>
      </div>

      <div class="login-tabs">
        <button
          :class="['tab', { active: mode === 'login' }]"
          @click="mode = 'login'"
        >登录</button>
        <button
          :class="['tab', { active: mode === 'register' }]"
          @click="mode = 'register'"
        >注册</button>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="username"
            type="text"
            class="input"
            placeholder="请输入用户名"
            autocomplete="username"
            required
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            class="input"
            placeholder="请输入密码"
            autocomplete="current-password"
            required
          />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          {{ loading ? '提交中...' : (mode === 'login' ? '登 录' : '注 册') }}
        </button>
      </form>

      <p class="login-hint">
        {{ mode === 'login' ? '演示账号 admin / admin123' : '密码长度不少于6位' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const mode = ref('login')
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await auth.login(username.value, password.value)
    } else {
      await auth.register(username.value, password.value)
    }
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    error.value = e.response?.data?.error || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(199, 82, 42, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(37, 109, 107, 0.04) 0%, transparent 50%),
    var(--paper);
  padding: var(--space-md);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--card);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--line);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.login-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -0.02em;
}

.login-subtitle {
  color: var(--ink-secondary);
  font-size: 0.9rem;
  margin-top: var(--space-xs);
}

.login-tabs {
  display: flex;
  gap: 0;
  margin-bottom: var(--space-lg);
  background: var(--muted);
  border-radius: var(--radius-md);
  padding: 4px;
}

.tab {
  flex: 1;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-secondary);
  background: transparent;
  transition: all var(--duration-fast) var(--ease-out);
}

.tab.active {
  background: var(--card);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.error-msg {
  color: var(--accent);
  font-size: 0.85rem;
  padding: 8px 12px;
  background: rgba(199, 82, 42, 0.06);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent);
}

.login-btn {
  width: 100%;
  padding: 12px 24px;
  font-size: 1rem;
  margin-top: var(--space-sm);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-hint {
  text-align: center;
  color: #b8b0a8;
  font-size: 0.8rem;
  margin-top: var(--space-lg);
}
</style>
