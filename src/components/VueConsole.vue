<template>
  <!-- 自定义元素模式：不使用 Teleport，内容直接渲染到 Shadow DOM -->
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
  }>(),
  {
    defaultTheme: 'light'
  }
)

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
  if (!touch) return
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  touchStartTime = Date.now()
}

function handleTouchMove(e: TouchEvent) {
  e.preventDefault()
  const touch = e.touches[0]
  if (!touch) return
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

// 暴露方法给自定义元素外部调用
defineExpose({
  show,
  hide,
  toggleTheme,
  clearCurrentPanel
})
</script>

<style scoped>
.vue-console {
  --vc-primary: #42b983;
  --vc-bg: #fff;
  --vc-text: #2c3e50;
  --vc-border: #e0e0e0;
  --vc-hover: #f0f0f0;
  --vc-log-bg: #fafafa;
  font: 14px system-ui, sans-serif;
  color: var(--vc-text);
}
.vue-console--dark {
  --vc-bg: #1e1e1e;
  --vc-text: #d4d4d4;
  --vc-border: #3e3e3e;
  --vc-hover: #2d2d2d;
  --vc-log-bg: #252526;
}
.vue-console__switch {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--vc-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,.2);
  z-index: 10000;
  touch-action: none;
}
.vue-console__switch-text {
  font-size: 12px;
  font-weight: bold;
  writing-mode: vertical-lr;
}
.vue-console__panel {
  position: fixed;
  inset: 0;
  background: var(--vc-bg);
  z-index: 10001;
  display: flex;
  flex-direction: column;
}
.vue-console__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--vc-border);
}
.vue-console__tabs {
  display: flex;
  flex: 1;
  overflow-x: auto;
}
.vue-console__tabs::-webkit-scrollbar { display: none; }
.vue-console__tab {
  padding: 10px 12px;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  color: var(--vc-text);
  opacity: .6;
}
.vue-console__tab--active {
  opacity: 1;
  border-bottom-color: var(--vc-primary);
  font-weight: bold;
}
.vue-console__close {
  padding: 10px 14px;
  border: none;
  background: transparent;
  font-size: 20px;
  color: var(--vc-text);
}
.vue-console__content {
  flex: 1;
  overflow: hidden;
  background: var(--vc-log-bg);
}
.vue-console__toolbar {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--vc-border);
}
.vue-console__toolbar button {
  padding: 6px 12px;
  border: 1px solid var(--vc-border);
  background: var(--vc-bg);
  color: var(--vc-text);
  border-radius: 4px;
  font-size: 12px;
}
</style>
