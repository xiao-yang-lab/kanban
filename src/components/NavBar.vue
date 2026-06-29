<template>
  <header class="navbar">
    <div class="nav-left">
      <h1 class="nav-brand">Kanban</h1>
      <span class="nav-divider">/</span>
      <span class="nav-subtitle">任务管理</span>
    </div>

    <div class="nav-right">
      <SearchFilter />

      <button class="btn-icon" title="导出 JSON" @click="$emit('export')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>

      <label class="btn-icon import-btn" title="导入 JSON">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="3 10 12 3 21 10"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <input type="file" accept=".json" @change="$emit('import', $event)" hidden />
      </label>

      <span class="nav-user">{{ auth.user?.username }}</span>
      <button class="btn btn-sm btn-secondary" @click="handleLogout">退出</button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import SearchFilter from './SearchFilter.vue'

const auth = useAuthStore()
const router = useRouter()

defineEmits(['export', 'import'])

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-xl);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 100;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.nav-left {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.nav-brand {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -0.02em;
}

.nav-divider {
  color: var(--line);
  font-size: 1.2rem;
  font-weight: 300;
}

.nav-subtitle {
  font-size: 0.85rem;
  color: var(--ink-secondary);
  font-weight: 500;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.nav-user {
  font-size: 0.85rem;
  color: var(--ink-secondary);
  font-weight: 500;
  padding: 0 var(--space-sm);
}

.import-btn {
  position: relative;
  cursor: pointer;
}

.import-btn input {
  display: none;
}
</style>
