<template>
  <div
    :class="['task-card', `priority-${task.priority}`, { selected: selected }]"
    @click="$emit('select', task)"
  >
    <div class="card-header">
      <span :class="['priority-dot', task.priority]"></span>
      <h3 class="card-title">{{ task.title }}</h3>
    </div>

    <p v-if="task.description" class="card-desc">{{ task.description }}</p>

    <div class="card-meta">
      <span v-if="task.dueDate" :class="['due-badge', { overdue: isOverdue }]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        {{ formatDate(task.dueDate) }}
      </span>
      <span :class="['priority-tag', task.priority]">{{ priorityLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: { type: Object, required: true },
  selected: { type: Boolean, default: false }
})

defineEmits(['select'])

const priorityLabel = computed(() => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[props.task.priority] || '中'
})

const isOverdue = computed(() => {
  if (!props.task.dueDate) return false
  return new Date(props.task.dueDate) < new Date() && props.task.status !== 'done'
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.task-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  position: relative;
  animation: fadeInUp 0.3s var(--ease-out);
}

.task-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
  border-color: #d0c9c0;
}

.task-card.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(199, 82, 42, 0.1);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}

.priority-dot.high { background: var(--priority-high); }
.priority-dot.medium { background: var(--priority-medium); }
.priority-dot.low { background: var(--priority-low); }

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.4;
}

.card-desc {
  font-size: 0.8rem;
  color: var(--ink-secondary);
  line-height: 1.5;
  margin-bottom: var(--space-sm);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.due-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: var(--ink-secondary);
  background: var(--muted);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
}

.due-badge.overdue {
  color: var(--accent);
  background: rgba(199, 82, 42, 0.08);
}

.priority-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.priority-tag.high {
  background: rgba(199, 82, 42, 0.1);
  color: var(--priority-high);
}

.priority-tag.medium {
  background: rgba(212, 160, 23, 0.1);
  color: var(--priority-medium);
}

.priority-tag.low {
  background: rgba(92, 141, 110, 0.1);
  color: var(--priority-low);
}
</style>
