<template>
  <div class="system-panel">
    <div class="system-panel__section">
      <h3 class="system-panel__title">设备信息</h3>
      <div class="system-panel__list">
        <div v-for="(value, key) in deviceInfo" :key="key" class="system-panel__item">
          <span class="system-panel__label">{{ key }}:</span>
          <span class="system-panel__value">{{ value }}</span>
        </div>
      </div>
    </div>

    <div class="system-panel__section">
      <h3 class="system-panel__title">存储信息</h3>
      <div class="system-panel__list">
        <div v-for="(value, key) in storageInfo" :key="key" class="system-panel__item">
          <span class="system-panel__label">{{ key }}:</span>
          <span class="system-panel__value">{{ value }}</span>
        </div>
      </div>
    </div>

    <div class="system-panel__section">
      <h3 class="system-panel__title">性能信息</h3>
      <div class="system-panel__list">
        <div v-for="(value, key) in performanceInfo" :key="key" class="system-panel__item">
          <span class="system-panel__label">{{ key }}:</span>
          <span class="system-panel__value">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDeviceInfo, getStorageInfo } from '../utils'

const deviceInfo = ref<Record<string, any>>({})
const storageInfo = ref<Record<string, any>>({})
const performanceInfo = ref<Record<string, any>>({})

function updateInfo() {
  deviceInfo.value = getDeviceInfo()
  storageInfo.value = getStorageInfo()
  
  // 性能信息
  const perfAny = performance as any
  if (perfAny && perfAny.memory) {
    const memory = perfAny.memory
    performanceInfo.value = {
      'JS堆大小': `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      'JS堆限制': `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
      'JS总堆大小': `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`
    }
  } else {
    performanceInfo.value = {
      '说明': '性能API不可用'
    }
  }
}

onMounted(() => {
  updateInfo()
})
</script>

<style scoped>
.system-panel {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  -webkit-overflow-scrolling: touch;
}

.system-panel__section {
  margin-bottom: 24px;
  background: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.system-panel__title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: bold;
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 8px;
}

.system-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.system-panel__item {
  display: flex;
  padding: 8px;
  border-radius: 4px;
  background: var(--log-bg);
  font-size: 13px;
  line-height: 1.6;
}

.system-panel__label {
  font-weight: 600;
  color: var(--text-color);
  min-width: 100px;
  flex-shrink: 0;
}

.system-panel__value {
  color: var(--text-color);
  opacity: 0.8;
  word-break: break-all;
}
</style>
