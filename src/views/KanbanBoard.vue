<template>
  <div class="kanban-page">
    <NavBar
      @export="handleExport"
      @import="handleImport"
    />

    <div class="board-container">
      <div class="board-header fade-up">
        <div class="board-stats">
          <div class="stat-card">
            <span class="stat-num">{{ taskStore.tasks.length }}</span>
            <span class="stat-label">全部任务</span>
          </div>
          <div class="stat-card stat-todo">
            <span class="stat-num">{{ taskStore.todoTasks.length }}</span>
            <span class="stat-label">待处理</span>
          </div>
          <div class="stat-card stat-progress">
            <span class="stat-num">{{ taskStore.inProgressTasks.length }}</span>
            <span class="stat-label">进行中</span>
          </div>
          <div class="stat-card stat-done">
            <span class="stat-num">{{ taskStore.doneTasks.length }}</span>
            <span class="stat-label">已完成</span>
          </div>
        </div>
        <div class="board-hint">
          <span class="hint-key">Del</span> 删除选中 &middot;
          <span class="hint-key">N</span> 新建 &middot;
          拖拽移动
        </div>
      </div>

      <div v-if="taskStore.error" class="error-banner">
        {{ taskStore.error }}
      </div>

      <div class="board-columns fade-up">
        <TaskColumn
          title="待处理"
          status="todo"
          :tasks="taskStore.todoTasks"
          :selected-id="selectedTask?.id"
          @add="openForm(null, 'todo')"
          @select="selectTask"
          @move="handleMove"
        />
        <TaskColumn
          title="进行中"
          status="in-progress"
          :tasks="taskStore.inProgressTasks"
          :selected-id="selectedTask?.id"
          @add="openForm(null, 'in-progress')"
          @select="selectTask"
          @move="handleMove"
        />
        <TaskColumn
          title="已完成"
          status="done"
          :tasks="taskStore.doneTasks"
          :selected-id="selectedTask?.id"
          @add="openForm(null, 'done')"
          @select="selectTask"
          @move="handleMove"
        />
      </div>
    </div>

    <!-- 任务编辑/新建弹窗 -->
    <TaskForm
      :visible="formVisible"
      :task="formTask"
      @close="closeForm"
      @save="handleSave"
      @delete="handleDelete"
    />

    <!-- 导入结果消息 -->
    <div v-if="importMsg" class="toast scale-in" :class="importMsg.type">
      {{ importMsg.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useKeyboard } from '@/composables/useKeyboard'
import NavBar from '@/components/NavBar.vue'
import TaskColumn from '@/components/TaskColumn.vue'
import TaskForm from '@/components/TaskForm.vue'

const taskStore = useTasksStore()

const selectedTask = ref(null)
const formVisible = ref(false)
const formTask = ref(null)
const importMsg = ref(null)

onMounted(() => {
  taskStore.fetchTasks()
})

// 选择任务
function selectTask(task) {
  selectedTask.value = task
}

// 打开表单
function openForm(task = null, defaultStatus = 'todo') {
  formTask.value = task ? { ...task } : { status: defaultStatus, priority: 'medium', dueDate: '', title: '', description: '' }
  formVisible.value = true
}

// 关闭表单
function closeForm() {
  formVisible.value = false
  formTask.value = null
}

// 保存任务
async function handleSave(data) {
  try {
    if (formTask.value?.id) {
      await taskStore.updateTask(formTask.value.id, data)
    } else {
      await taskStore.createTask(data)
    }
    closeForm()
  } catch (e) {
    alert(e.response?.data?.error || '保存失败')
  }
}

// 删除任务
async function handleDelete(id) {
  try {
    await taskStore.deleteTask(id)
    if (selectedTask.value?.id === id) selectedTask.value = null
    closeForm()
  } catch (e) {
    alert('删除失败')
  }
}

// 拖拽移动
async function handleMove(taskId, newStatus) {
  await taskStore.moveTask(taskId, newStatus)
}

// 导出
async function handleExport() {
  try {
    await taskStore.exportTasks()
    showToast('导出成功', 'success')
  } catch {
    showToast('导出失败', 'error')
  }
}

// 导入
async function handleImport(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const count = await taskStore.importTasks(file)
    showToast(`成功导入 ${count} 个任务`, 'success')
  } catch {
    showToast('导入失败，请检查 JSON 格式', 'error')
  }
  event.target.value = ''
}

// Toast 消息
function showToast(text, type = 'success') {
  importMsg.value = { text, type }
  setTimeout(() => { importMsg.value = null }, 3000)
}

// 键盘快捷键
useKeyboard({
  'delete': () => {
    if (selectedTask.value) {
      handleDelete(selectedTask.value.id)
    }
  },
  'backspace': () => {
    if (selectedTask.value) {
      handleDelete(selectedTask.value.id)
    }
  },
  'n': () => {
    openForm(null, 'todo')
  },
  'escape': () => {
    if (formVisible.value) {
      closeForm()
    } else {
      selectedTask.value = null
    }
  },
  'e': () => {
    if (selectedTask.value) {
      openForm(selectedTask.value)
    }
  }
})
</script>

<style scoped>
.kanban-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--paper);
}

.board-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-lg) var(--space-xl);
  gap: var(--space-lg);
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.board-stats {
  display: flex;
  gap: var(--space-md);
}

.stat-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: var(--space-sm) var(--space-lg);
  text-align: center;
  min-width: 80px;
}

.stat-num {
  display: block;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--ink);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.72rem;
  color: var(--ink-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-todo .stat-num { color: var(--status-todo); }
.stat-progress .stat-num { color: var(--status-in-progress); }
.stat-done .stat-num { color: var(--status-done); }

.board-hint {
  font-size: 0.78rem;
  color: #b8b0a8;
}

.hint-key {
  display: inline-block;
  background: var(--line-light);
  padding: 1px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.75rem;
  border: 1px solid var(--line);
}

.error-banner {
  background: rgba(199, 82, 42, 0.06);
  color: var(--accent);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  border-left: 3px solid var(--accent);
}

.board-columns {
  flex: 1;
  display: flex;
  gap: var(--space-lg);
  overflow-x: auto;
  padding-bottom: var(--space-md);
  align-items: flex-start;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 2000;
  box-shadow: var(--shadow-lg);
}

.toast.success {
  background: var(--teal);
  color: #fff;
}

.toast.error {
  background: var(--accent);
  color: #fff;
}

/* 响应式 */
@media (max-width: 960px) {
  .board-columns {
    flex-direction: column;
    align-items: stretch;
    overflow-x: visible;
  }

  .board-stats {
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .stat-card {
    flex: 1;
    min-width: 60px;
    padding: var(--space-xs) var(--space-md);
  }

  .stat-num {
    font-size: 1.2rem;
  }
}
</style>
