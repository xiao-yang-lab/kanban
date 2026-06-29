<template>
  <div :class="['task-column', `column-${status}`]">
    <div class="column-header">
      <div class="column-title">
        <span :class="['status-indicator', status]"></span>
        <h3>{{ title }}</h3>
        <span class="column-count">{{ tasks.length }}</span>
      </div>
      <button class="btn-icon" title="添加任务" @click="$emit('add')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>

    <draggable
      :model-value="tasks"
      :group="{ name: 'tasks', pull: true, put: true }"
      item-key="id"
      class="column-body"
      ghost-class="drag-ghost"
      drag-class="drag-dragging"
      :animation="200"
      @change="handleChange"
      @start="$emit('drag-start')"
      @end="$emit('drag-end')"
    >
      <template #item="{ element, index }">
        <div :style="{ animationDelay: `${index * 0.04}s` }">
          <TaskCard
            :task="element"
            :selected="selectedId === element.id"
            @select="$emit('select', element)"
          />
        </div>
      </template>
    </draggable>

    <div v-if="tasks.length === 0" class="column-empty">
      <p>暂无任务</p>
    </div>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'

defineProps({
  title: { type: String, required: true },
  status: { type: String, required: true },
  tasks: { type: Array, required: true },
  selectedId: { type: String, default: null }
})

const emit = defineEmits(['add', 'select', 'move', 'drag-start', 'drag-end'])

function handleChange(event) {
  if (event.added) {
    emit('move', event.added.element.id, event.added.element.status)
  }
}
</script>

<style scoped>
.task-column {
  flex: 1;
  min-width: 300px;
  max-width: 380px;
  background: var(--muted);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line-light);
  transition: background var(--duration-fast);
}

.task-column:hover {
  background: #f0ede8;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--line);
}

.column-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-indicator.todo { background: var(--status-todo); }
.status-indicator.in-progress { background: var(--status-in-progress); animation: pulse 2s infinite; }
.status-indicator.done { background: var(--status-done); }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.column-title h3 {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink);
}

.column-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ink-secondary);
  background: var(--line-light);
  padding: 2px 8px;
  border-radius: 999px;
  min-width: 24px;
  text-align: center;
}

.column-body {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  overflow-y: auto;
  min-height: 200px;
}

.column-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  min-height: 200px;
}

.column-empty p {
  color: #c5bdb5;
  font-size: 0.85rem;
  font-style: italic;
}

/* vuedraggable 拖拽样式 */
.drag-ghost {
  opacity: 0.3;
  background: var(--line-light);
  border: 2px dashed var(--line);
  border-radius: var(--radius-lg);
}

.drag-dragging {
  opacity: 0.8;
  transform: rotate(2deg);
  box-shadow: var(--shadow-xl) !important;
  border-color: var(--accent) !important;
}

/* 响应式 */
@media (max-width: 960px) {
  .task-column {
    min-width: 260px;
    max-width: none;
  }
}
</style>
