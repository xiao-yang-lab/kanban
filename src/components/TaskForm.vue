<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content task-form">
      <div class="form-header">
        <h2>{{ isEdit ? '编辑任务' : '新建任务' }}</h2>
        <button class="btn-icon" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>标题 <span class="required">*</span></label>
          <input
            v-model="form.title"
            type="text"
            class="input"
            placeholder="任务标题"
            required
            autofocus
          />
        </div>

        <div class="form-group">
          <label>描述</label>
          <textarea
            v-model="form.description"
            class="input"
            rows="3"
            placeholder="任务描述（可选）"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status" class="input">
              <option value="todo">待处理</option>
              <option value="in-progress">进行中</option>
              <option value="done">已完成</option>
            </select>
          </div>
          <div class="form-group">
            <label>优先级</label>
            <select v-model="form.priority" class="input">
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>截止日期</label>
          <input v-model="form.dueDate" type="date" class="input" />
        </div>

        <div class="form-actions">
          <button v-if="isEdit" type="button" class="btn btn-danger btn-sm" @click="handleDelete">
            删除任务
          </button>
          <div class="spacer"></div>
          <button type="button" class="btn btn-secondary btn-sm" @click="$emit('close')">取消</button>
          <button type="submit" class="btn btn-primary btn-sm" :disabled="submitting">
            {{ submitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save', 'delete'])

const isEdit = computed(() => !!props.task)
const submitting = computed(() => false)

const form = reactive({
  title: props.task?.title || '',
  description: props.task?.description || '',
  status: props.task?.status || 'todo',
  priority: props.task?.priority || 'medium',
  dueDate: props.task?.dueDate || ''
})

function handleSubmit() {
  emit('save', { ...form })
}

function handleDelete() {
  if (confirm('确认删除该任务？此操作不可撤销。')) {
    emit('delete', props.task.id)
  }
}
</script>

<style scoped>
.task-form {
  max-width: 480px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.form-header h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
}

.form-header .btn-icon {
  font-size: 1.5rem;
  color: var(--ink-secondary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.required {
  color: var(--accent);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.form-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--line);
}

.spacer {
  flex: 1;
}
</style>
