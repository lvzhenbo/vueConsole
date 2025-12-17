<template>
  <div class="storage-panel">
    <div class="storage-panel__tabs">
      <button v-for="tab in tabs" :key="tab" class="storage-panel__tab"
        :class="{ 'storage-panel__tab--active': activeTab === tab }" @click="activeTab = tab">
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
  border-bottom: 1px solid var(--vc-border);
  background: var(--vc-bg);
}

.storage-panel__tab {
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: var(--vc-text);
  opacity: .6;
  border-bottom: 2px solid transparent;
}

.storage-panel__tab--active {
  opacity: 1;
  border-bottom-color: var(--vc-primary);
  font-weight: bold;
}

.storage-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.storage-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.storage-empty {
  padding: 40px 16px;
  text-align: center;
  color: #999;
}

.storage-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px;
  background: var(--vc-bg);
  border-radius: 4px;
  border-left: 3px solid var(--vc-primary);
}

.storage-item__key,
.storage-item__value {
  font-family: monospace;
  font-size: 11px;
  word-break: break-all;
}

.storage-item__key {
  font-weight: bold;
  color: var(--vc-text);
  min-width: 80px;
}

.storage-item__value {
  flex: 1;
  color: var(--vc-text);
  opacity: .8;
}

.storage-item__delete {
  padding: 3px 6px;
  border: 1px solid #f5222d;
  background: transparent;
  color: #f5222d;
  border-radius: 3px;
  font-size: 10px;
  flex-shrink: 0;
}

.storage-item__delete:active {
  background: #f5222d;
  color: #fff;
}

.storage-panel__toolbar {
  display: flex;
  gap: 6px;
  padding: 6px;
  border-top: 1px solid var(--vc-border);
  background: var(--vc-bg);
}

.storage-panel__toolbar button {
  padding: 5px 10px;
  border: 1px solid var(--vc-border);
  background: var(--vc-bg);
  color: var(--vc-text);
  border-radius: 4px;
  font-size: 12px;
}
</style>
