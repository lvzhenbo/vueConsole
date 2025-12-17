<template>
  <div class="storage-panel">
    <div class="storage-panel__tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="storage-panel__tab"
        :class="{ 'storage-panel__tab--active': activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div class="storage-panel__content">
      <!-- Cookies -->
      <div v-if="activeTab === 'Cookies'" class="storage-list">
        <div v-if="cookies.length === 0" class="storage-empty">暂无Cookies</div>
        <div v-for="item in cookies" :key="item.key" class="storage-item">
          <div class="storage-item__key">{{ item.key }}</div>
          <div class="storage-item__value">{{ item.value }}</div>
          <button class="storage-item__delete" @click="deleteCookie(item.key)">删除</button>
        </div>
      </div>

      <!-- LocalStorage -->
      <div v-if="activeTab === 'LocalStorage'" class="storage-list">
        <div v-if="localStorageItems.length === 0" class="storage-empty">暂无LocalStorage</div>
        <div v-for="item in localStorageItems" :key="item.key" class="storage-item">
          <div class="storage-item__key">{{ item.key }}</div>
          <div class="storage-item__value">{{ item.value }}</div>
          <button class="storage-item__delete" @click="deleteLocalStorage(item.key)">删除</button>
        </div>
      </div>

      <!-- SessionStorage -->
      <div v-if="activeTab === 'SessionStorage'" class="storage-list">
        <div v-if="sessionStorageItems.length === 0" class="storage-empty">暂无SessionStorage</div>
        <div v-for="item in sessionStorageItems" :key="item.key" class="storage-item">
          <div class="storage-item__key">{{ item.key }}</div>
          <div class="storage-item__value">{{ item.value }}</div>
          <button class="storage-item__delete" @click="deleteSessionStorage(item.key)">删除</button>
        </div>
      </div>
    </div>

    <div class="storage-panel__toolbar">
      <button @click="refresh">刷新</button>
      <button @click="clearAll">清空全部</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { parseCookies } from '../utils'
import type { StorageItem } from '../types'

const activeTab = ref('Cookies')
const tabs = ['Cookies', 'LocalStorage', 'SessionStorage']

const cookies = ref<StorageItem[]>([])
const localStorageItems = ref<StorageItem[]>([])
const sessionStorageItems = ref<StorageItem[]>([])

function loadCookies() {
  cookies.value = parseCookies()
}

function loadLocalStorage() {
  const items: StorageItem[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        items.push({
          key,
          value: localStorage.getItem(key) || ''
        })
      }
    }
  } catch (e) {
    console.error('读取LocalStorage失败:', e)
  }
  localStorageItems.value = items
}

function loadSessionStorage() {
  const items: StorageItem[] = []
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key) {
        items.push({
          key,
          value: sessionStorage.getItem(key) || ''
        })
      }
    }
  } catch (e) {
    console.error('读取SessionStorage失败:', e)
  }
  sessionStorageItems.value = items
}

function deleteCookie(key: string) {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  refresh()
}

function deleteLocalStorage(key: string) {
  try {
    localStorage.removeItem(key)
    refresh()
  } catch (e) {
    console.error('删除LocalStorage失败:', e)
  }
}

function deleteSessionStorage(key: string) {
  try {
    sessionStorage.removeItem(key)
    refresh()
  } catch (e) {
    console.error('删除SessionStorage失败:', e)
  }
}

function clearAll() {
  if (!confirm('确定要清空所有存储吗？')) return

  switch (activeTab.value) {
    case 'Cookies':
      cookies.value.forEach(item => deleteCookie(item.key))
      break
    case 'LocalStorage':
      try {
        localStorage.clear()
      } catch (e) {
        console.error('清空LocalStorage失败:', e)
      }
      break
    case 'SessionStorage':
      try {
        sessionStorage.clear()
      } catch (e) {
        console.error('清空SessionStorage失败:', e)
      }
      break
  }
  
  refresh()
}

function refresh() {
  loadCookies()
  loadLocalStorage()
  loadSessionStorage()
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.storage-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.storage-panel__tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color);
}

.storage-panel__tab {
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.6;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.storage-panel__tab--active {
  opacity: 1;
  border-bottom-color: var(--primary-color);
  font-weight: bold;
}

.storage-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  -webkit-overflow-scrolling: touch;
}

.storage-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.storage-empty {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.storage-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: var(--bg-color);
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
}

.storage-item__key {
  font-weight: bold;
  color: var(--text-color);
  min-width: 100px;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.storage-item__value {
  flex: 1;
  color: var(--text-color);
  opacity: 0.8;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.storage-item__delete {
  padding: 4px 8px;
  border: 1px solid #f5222d;
  background: transparent;
  color: #f5222d;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  flex-shrink: 0;
}

.storage-item__delete:active {
  background: #f5222d;
  color: white;
}

.storage-panel__toolbar {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-color);
}

.storage-panel__toolbar button {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.storage-panel__toolbar button:hover {
  background: var(--hover-color);
}
</style>
