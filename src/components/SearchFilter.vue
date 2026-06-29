<template>
  <div class="search-filter">
    <div class="search-box">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        v-model="searchText"
        type="text"
        class="search-input"
        placeholder="搜索任务..."
        @input="onSearch"
      />
      <button v-if="searchText" class="search-clear" @click="clearSearch">×</button>
    </div>
    <select v-model="priorityFilter" class="filter-select" @change="onFilter">
      <option value="">全部优先级</option>
      <option value="high">高优先</option>
      <option value="medium">中优先</option>
      <option value="low">低优先</option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'

const taskStore = useTasksStore()
const searchText = ref('')
const priorityFilter = ref('')

let debounceTimer = null

function onSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    taskStore.fetchTasks({
      search: searchText.value || undefined,
      priority: priorityFilter.value || undefined
    })
  }, 300)
}

function onFilter() {
  taskStore.fetchTasks({
    search: searchText.value || undefined,
    priority: priorityFilter.value || undefined
  })
}

function clearSearch() {
  searchText.value = ''
  onSearch()
}
</script>

<style scoped>
.search-filter {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #b8b0a8;
  pointer-events: none;
}

.search-input {
  padding: 6px 32px 6px 32px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  background: var(--card);
  color: var(--ink);
  width: 180px;
  transition: border-color var(--duration-fast) var(--ease-out), width var(--duration-fast) var(--ease-out);
}

.search-input:focus {
  border-color: var(--accent);
  width: 220px;
  box-shadow: 0 0 0 3px rgba(199, 82, 42, 0.06);
}

.search-clear {
  position: absolute;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--line-light);
  color: var(--ink-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  line-height: 1;
  border: none;
  cursor: pointer;
}

.filter-select {
  padding: 6px 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  background: var(--card);
  color: var(--ink);
  cursor: pointer;
}
</style>
