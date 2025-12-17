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
  padding: 12px;
}

.system-panel__section {
  margin-bottom: 16px;
  background: var(--vc-bg);
  border-radius: 6px;
  padding: 12px;
}

.system-panel__title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: bold;
  color: var(--vc-primary);
  border-bottom: 2px solid var(--vc-primary);
  padding-bottom: 6px;
}

.system-panel__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.system-panel__item {
  display: flex;
  padding: 6px;
  border-radius: 4px;
  background: var(--vc-log-bg);
  font-size: 12px;
  line-height: 1.5;
}

.system-panel__label {
  font-weight: 600;
  color: var(--vc-text);
  min-width: 90px;
  flex-shrink: 0;
}

.system-panel__value {
  color: var(--vc-text);
  opacity: .8;
  word-break: break-all;
}
</style>
