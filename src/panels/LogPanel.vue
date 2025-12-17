<template>
  <div class="log-panel">
    <!-- 工具栏 -->
    <div class="log-panel__toolbar">
      <button class="log-panel__btn" @click="clearLogs" title="清空日志">
        🗑️ 清空
      </button>
      <div class="log-panel__filter">
        <button v-for="filter in logFilters" :key="filter.type" class="log-panel__filter-btn"
          :class="{ 'log-panel__filter-btn--active': activeFilters.includes(filter.type) }"
          @click="toggleFilter(filter.type)">
          {{ filter.icon }} {{ filter.label }}
        </button>
      </div>
    </div>

    <div class="log-panel__list" ref="logListRef">
      <div v-for="log in filteredLogs" :key="log.id" class="log-item" :class="`log-item--${log.type}`">
        <div class="log-item__header">
          <span class="log-item__icon">{{ getLogIcon(log.type) }}</span>
          <span class="log-item__time">{{ formatTime(log.time) }}</span>
          <span v-if="log.repeated > 1" class="log-item__count">{{ log.repeated }}</span>
        </div>
        <div class="log-item__content">
          <template v-for="(item, index) in log.content" :key="index">
            <LogTree :value="item" :is-root="true" :expanded-paths="getExpandedPaths(log.id)"
              :path="`${log.id}_${index}`" @toggle-path="(path) => togglePath(log.id, path)" />
            <span v-if="index < log.content.length - 1" class="log-item__separator"> </span>
          </template>
        </div>
      </div>
      <div v-if="filteredLogs.length === 0" class="log-panel__empty">
        {{ logList.length === 0 ? '暂无日志' : '没有匹配的日志' }}
      </div>
    </div>

    <div class="log-panel__input">
      <input v-model="command" type="text" placeholder="输入JavaScript命令..." @keyup.enter="executeCommand" />
      <button @click="executeCommand">执行</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, reactive } from 'vue'
import { logList, executeCommand as execCmd, clearLogs as clearAllLogs } from '../core/logger'
import { formatTime } from '../utils'
import LogTree from '../components/LogTree.vue'
import type { LogType } from '../types'

const logListRef = ref<HTMLElement>()
const command = ref('')

// 日志过滤器
const logFilters = [
  { type: 'log' as LogType, icon: 'ℹ️', label: 'Log' },
  { type: 'info' as LogType, icon: 'ℹ️', label: 'Info' },
  { type: 'warn' as LogType, icon: '⚠️', label: 'Warn' },
  { type: 'error' as LogType, icon: '❌', label: 'Error' },
  { type: 'debug' as LogType, icon: '🐛', label: 'Debug' }
]

const activeFilters = ref<LogType[]>(['log', 'info', 'warn', 'error', 'debug'])

// 过滤后的日志
const filteredLogs = computed(() => {
  if (activeFilters.value.length === 0 || activeFilters.value.length === logFilters.length) {
    return logList.value
  }
  return logList.value.filter(log => activeFilters.value.includes(log.type))
})

// 切换过滤器
function toggleFilter(type: LogType) {
  const index = activeFilters.value.indexOf(type)
  if (index === -1) {
    activeFilters.value.push(type)
  } else {
    activeFilters.value.splice(index, 1)
  }
}

// 展开路径管理 - 每个日志项单独管理
const expandedPathsMap = reactive<Map<string, Set<string>>>(new Map())

function getExpandedPaths(logId: string): Set<string> {
  if (!expandedPathsMap.has(logId)) {
    expandedPathsMap.set(logId, new Set())
  }
  return expandedPathsMap.get(logId)!
}

function togglePath(logId: string, path: string) {
  const paths = getExpandedPaths(logId)
  if (paths.has(path)) {
    paths.delete(path)
  } else {
    paths.add(path)
  }
}

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

function executeCommand() {
  if (!command.value.trim()) return

  execCmd(command.value)
  command.value = ''
}

// 清空日志
function clearLogs() {
  clearAllLogs()
  expandedPathsMap.clear()
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
  background: var(--vc-log-bg);
}

.log-panel__toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-bottom: 1px solid var(--vc-border);
  background: var(--vc-bg);
  flex-wrap: wrap;
}

.log-panel__btn {
  padding: 4px 8px;
  border: 1px solid var(--vc-border);
  border-radius: 4px;
  background: var(--vc-bg);
  color: var(--vc-text);
  font-size: 12px;
}

.log-panel__filter {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.log-panel__filter-btn {
  padding: 2px 6px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--vc-text);
  font-size: 11px;
  opacity: .5;
}

.log-panel__filter-btn--active {
  opacity: 1;
  background: var(--vc-primary);
  color: #fff;
}

.log-panel__list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.log-panel__empty {
  padding: 40px 16px;
  text-align: center;
  color: #999;
}

.log-item {
  margin-bottom: 6px;
  padding: 6px;
  border-radius: 4px;
  background: var(--vc-bg);
  border-left: 3px solid #ccc;
  word-break: break-word;
}

.log-item--log {
  border-left-color: #42b983;
}

.log-item--info {
  border-left-color: #1890ff;
}

.log-item--warn {
  border-left-color: #faad14;
  background: rgba(250, 173, 20, .08);
}

.log-item--error {
  border-left-color: #f5222d;
  background: rgba(245, 34, 45, .08);
}

.log-item--debug {
  border-left-color: #722ed1;
}

.log-item__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}

.log-item__icon {
  font-size: 12px;
}

.log-item__time {
  font-family: monospace;
}

.log-item__count {
  background: #666;
  color: #fff;
  padding: 1px 5px;
  border-radius: 8px;
  font-size: 10px;
}

.log-item__content {
  font-family: monospace;
  font-size: 12px;
  color: var(--vc-text);
  line-height: 1.4;
}

.log-item__separator {
  margin-right: 6px;
}

.log-panel__input {
  display: flex;
  gap: 6px;
  padding: 6px;
  border-top: 1px solid var(--vc-border);
  background: var(--vc-bg);
}

.log-panel__input input {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--vc-border);
  border-radius: 4px;
  background: var(--vc-bg);
  color: var(--vc-text);
  font-size: 14px;
}

.log-panel__input button {
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  background: var(--vc-primary);
  color: #fff;
}
</style>
