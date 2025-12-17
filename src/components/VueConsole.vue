<template>
  <Teleport :to="teleportTarget" :disabled="disableTeleport">
    <div v-if="isInstalled" class="vue-console" :class="{ 'vue-console--dark': theme === 'dark' }">
      <!-- 切换按钮 -->
      <div
        v-show="!isShow"
        ref="switchBtn"
        class="vue-console__switch"
        :style="switchStyle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @click="show"
      >
        <span class="vue-console__switch-text">调试</span>
      </div>

      <!-- 主面板 -->
      <div v-show="isShow" class="vue-console__panel">
        <!-- 头部 -->
        <div class="vue-console__header">
          <div class="vue-console__tabs">
            <div
              v-for="tab in tabs"
              :key="tab.id"
              class="vue-console__tab"
              :class="{ 'vue-console__tab--active': activeTab === tab.id }"
              @click="switchTab(tab.id)"
            >
              {{ tab.name }}
            </div>
          </div>
          <button class="vue-console__close" @click="hide">✕</button>
        </div>

        <!-- 内容区域 -->
        <div class="vue-console__content">
          <component :is="activeTabComponent" />
        </div>

        <!-- 工具栏 -->
        <div class="vue-console__toolbar">
          <button @click="toggleTheme">{{ theme === 'light' ? '🌙' : '☀️' }}</button>
          <button @click="clearCurrentPanel">清空</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { PanelConfig } from '../types'
import LogPanel from '../panels/LogPanel.vue'
import NetworkPanel from '../panels/NetworkPanel.vue'
import ElementPanel from '../panels/ElementPanel.vue'
import StoragePanel from '../panels/StoragePanel.vue'
import SystemPanel from '../panels/SystemPanel.vue'
import { hookConsole, unhookConsole, clearLogs } from '../core/logger'
import { hookNetwork, clearNetwork } from '../core/network'

const props = withDefaults(
  defineProps<{
    defaultTheme?: 'light' | 'dark'
    target?: HTMLElement | null
  }>(),
  {
    defaultTheme: 'light',
    target: null
  }
)

// 计算teleport目标
const teleportTarget = computed(() => {
  // 如果提供了自定义target，使用该元素
  if (props.target && props.target !== document.body) {
    return props.target
  }
  return 'body'
})

// 当target是自定义元素时，禁用teleport（因为组件已经挂载在目标元素内）
const disableTeleport = computed(() => {
  return props.target !== null && props.target !== document.body
})

const isInstalled = ref(false)
const isShow = ref(false)
const theme = ref(props.defaultTheme)
const activeTab = ref('log')

// 标签页配置
const tabs: PanelConfig[] = [
  { id: 'log', name: '日志', component: LogPanel },
  { id: 'system', name: '系统', component: SystemPanel },
  { id: 'network', name: '网络', component: NetworkPanel },
  { id: 'element', name: '元素', component: ElementPanel },
  { id: 'storage', name: '存储', component: StoragePanel }
]

const activeTabComponent = computed(() => {
  const tab = tabs.find(t => t.id === activeTab.value)
  return tab?.component
})

// 切换按钮位置
const switchStyle = ref<Record<string, string>>({
  right: '20px',
  bottom: '20px'
})

let touchStartX = 0
let touchStartY = 0
let touchStartTime = 0

function handleTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  touchStartTime = Date.now()
}

function handleTouchMove(e: TouchEvent) {
  e.preventDefault()
  const touch = e.touches[0]
  const deltaX = touch.clientX - touchStartX
  const deltaY = touch.clientY - touchStartY
  
  // 更新按钮位置
  const btn = e.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  
  switchStyle.value = {
    left: `${rect.left + deltaX}px`,
    top: `${rect.top + deltaY}px`
  }
  
  touchStartX = touch.clientX
  touchStartY = touch.clientY
}

function handleTouchEnd() {
  const touchDuration = Date.now() - touchStartTime
  
  // 如果拖动时间很短，认为是点击
  if (touchDuration < 200) {
    show()
  }
}

function show() {
  isShow.value = true
}

function hide() {
  isShow.value = false
}

function switchTab(tabId: string) {
  activeTab.value = tabId
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

function clearCurrentPanel() {
  switch (activeTab.value) {
    case 'log':
      clearLogs()
      break
    case 'network':
      clearNetwork()
      break
    default:
      break
  }
}

onMounted(() => {
  isInstalled.value = true
  hookConsole()
  hookNetwork()
  
  console.log('%c VueConsole %c 已启动 ', 'background:#35495e; color:#fff', 'background:#41b883; color:#fff')
})

onBeforeUnmount(() => {
  unhookConsole()
})
</script>

<style scoped>
.vue-console {
  --primary-color: #42b983;
  --bg-color: #ffffff;
  --text-color: #2c3e50;
  --border-color: #e0e0e0;
  --hover-color: #f5f5f5;
  --log-bg: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color);
}

.vue-console--dark {
  --bg-color: #1e1e1e;
  --text-color: #d4d4d4;
  --border-color: #3e3e3e;
  --hover-color: #2d2d2d;
  --log-bg: #252526;
}

.vue-console__switch {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  user-select: none;
  touch-action: none;
}

.vue-console__switch-text {
  font-size: 12px;
  font-weight: bold;
  writing-mode: vertical-lr;
}

.vue-console__panel {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-color);
  z-index: 10001;
  display: flex;
  flex-direction: column;
}

.vue-console__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color);
  position: relative;
}

.vue-console__tabs {
  display: flex;
  flex: 1;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.vue-console__tabs::-webkit-scrollbar {
  display: none;
}

.vue-console__tab {
  padding: 12px 16px;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  border-bottom: 2px solid transparent;
  color: var(--text-color);
  opacity: 0.6;
  transition: all 0.3s;
}

.vue-console__tab--active {
  opacity: 1;
  border-bottom-color: var(--primary-color);
  font-weight: bold;
}

.vue-console__close {
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  color: var(--text-color);
  opacity: 0.6;
}

.vue-console__close:hover {
  opacity: 1;
}

.vue-console__content {
  flex: 1;
  overflow: hidden;
  background: var(--log-bg);
}

.vue-console__toolbar {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-color);
}

.vue-console__toolbar button {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.vue-console__toolbar button:hover {
  background: var(--hover-color);
}
</style>
