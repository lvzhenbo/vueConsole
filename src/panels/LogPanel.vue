<template>
  <div class="log-panel">
    <div class="log-panel__list" ref="logListRef">
      <div
        v-for="log in logList"
        :key="log.id"
        class="log-item"
        :class="`log-item--${log.type}`"
      >
        <div class="log-item__header">
          <span class="log-item__icon">{{ getLogIcon(log.type) }}</span>
          <span class="log-item__time">{{ formatTime(log.time) }}</span>
          <span v-if="log.repeated > 1" class="log-item__count">{{ log.repeated }}</span>
        </div>
        <div class="log-item__content">
          <span v-for="(item, index) in log.content" :key="index" class="log-item__value">
            <span v-html="formatLogValue(item)"></span>
            <span v-if="index < log.content.length - 1"> </span>
          </span>
        </div>
      </div>
      <div v-if="logList.length === 0" class="log-panel__empty">
        暂无日志
      </div>
    </div>
    
    <div class="log-panel__input">
      <input
        v-model="command"
        type="text"
        placeholder="输入JavaScript命令..."
        @keyup.enter="executeCommand"
      />
      <button @click="executeCommand">执行</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { logList, executeCommand as execCmd } from '../core/logger'
import { formatTime, getType, escapeHtml } from '../utils'

const logListRef = ref<HTMLElement>()
const command = ref('')

function getLogIcon(type: string): string {
  const icons: Record<string, string> = {
    log: 'ℹ️',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    debug: '🐛'
  }
  return icons[type] || 'ℹ️'
}

function formatLogValue(value: any): string {
  const type = getType(value)
  
  if (value === null) {
    return '<span class="log-value log-value--null">null</span>'
  }
  
  if (value === undefined) {
    return '<span class="log-value log-value--undefined">undefined</span>'
  }
  
  if (typeof value === 'string') {
    return `<span class="log-value log-value--string">"${escapeHtml(value)}"</span>`
  }
  
  if (typeof value === 'number') {
    return `<span class="log-value log-value--number">${value}</span>`
  }
  
  if (typeof value === 'boolean') {
    return `<span class="log-value log-value--boolean">${value}</span>`
  }
  
  if (typeof value === 'function') {
    return `<span class="log-value log-value--function">ƒ ${value.name || 'anonymous'}()</span>`
  }
  
  if (Array.isArray(value)) {
    return `<span class="log-value log-value--array">Array(${value.length})</span>`
  }
  
  if (type === 'Object') {
    return `<span class="log-value log-value--object">{...}</span>`
  }
  
  if (value instanceof Error) {
    return `<span class="log-value log-value--error">${escapeHtml(value.message)}</span>`
  }
  
  try {
    return `<span class="log-value">${escapeHtml(JSON.stringify(value))}</span>`
  } catch (e) {
    return `<span class="log-value">${escapeHtml(String(value))}</span>`
  }
}

function executeCommand() {
  if (!command.value.trim()) return
  
  execCmd(command.value)
  command.value = ''
}

// 自动滚动到底部
watch(logList, async () => {
  await nextTick()
  if (logListRef.value) {
    logListRef.value.scrollTop = logListRef.value.scrollHeight
  }
}, { deep: true })
</script>

<style scoped>
.log-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--log-bg);
}

.log-panel__list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  -webkit-overflow-scrolling: touch;
}

.log-panel__empty {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.log-item {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  background: var(--bg-color);
  border-left: 3px solid #ccc;
  word-break: break-all;
}

.log-item--log {
  border-left-color: #42b983;
}

.log-item--info {
  border-left-color: #1890ff;
}

.log-item--warn {
  border-left-color: #faad14;
  background: rgba(250, 173, 20, 0.1);
}

.log-item--error {
  border-left-color: #f5222d;
  background: rgba(245, 34, 45, 0.1);
}

.log-item--debug {
  border-left-color: #722ed1;
}

.log-item__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.log-item__icon {
  font-size: 14px;
}

.log-item__time {
  font-family: 'Courier New', monospace;
}

.log-item__count {
  background: #666;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.log-item__content {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--text-color);
}

.log-item__value {
  margin-right: 8px;
}

.log-panel__input {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-color);
}

.log-panel__input input {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
}

.log-panel__input button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.log-panel__input button:active {
  opacity: 0.8;
}

:deep(.log-value) {
  color: var(--text-color);
}

:deep(.log-value--null),
:deep(.log-value--undefined) {
  color: #999;
  font-style: italic;
}

:deep(.log-value--string) {
  color: #c41a16;
}

:deep(.log-value--number) {
  color: #1c00cf;
}

:deep(.log-value--boolean) {
  color: #0d22aa;
  font-weight: bold;
}

:deep(.log-value--function) {
  color: #795da3;
  font-style: italic;
}

:deep(.log-value--array),
:deep(.log-value--object) {
  color: #1c00cf;
}

:deep(.log-value--error) {
  color: #f5222d;
}
</style>
