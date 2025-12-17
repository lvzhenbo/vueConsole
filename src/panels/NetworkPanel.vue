<template>
  <div class="network-panel">
    <div class="network-panel__list">
      <div v-if="networkList.length === 0" class="network-panel__empty">
        暂无网络请求
      </div>

      <div v-for="item in networkList" :key="item.id" class="network-item" :class="`network-item--${item.readyState}`"
        @click="selectItem(item)">
        <div class="network-item__header">
          <span class="network-item__method" :class="`network-item__method--${item.method.toLowerCase()}`">
            {{ item.method }}
          </span>
          <span class="network-item__url">{{ getShortUrl(item.url) }}</span>
          <span v-if="item.status" class="network-item__status" :class="getStatusClass(item.status)">
            {{ item.status }}
          </span>
        </div>
        <div class="network-item__info">
          <span class="network-item__time">{{ formatTime(item.requestTime) }}</span>
          <span v-if="item.duration" class="network-item__duration">
            {{ formatDuration(item.duration) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="selectedItem" class="network-detail" @click.self="closeDetail">
      <div class="network-detail__content">
        <div class="network-detail__header">
          <h3>请求详情</h3>
          <button @click="closeDetail">✕</button>
        </div>

        <div class="network-detail__body">
          <div class="network-detail__section">
            <h4>基本信息</h4>
            <div class="network-detail__info">
              <div><strong>URL:</strong> {{ selectedItem.url }}</div>
              <div><strong>方法:</strong> {{ selectedItem.method }}</div>
              <div><strong>状态:</strong> {{ selectedItem.status }} {{ selectedItem.statusText }}</div>
              <div><strong>耗时:</strong> {{ selectedItem.duration ? formatDuration(selectedItem.duration) : '-' }}</div>
            </div>
          </div>

          <div class="network-detail__section">
            <h4>请求头</h4>
            <pre class="network-detail__pre">{{ formatJson(selectedItem.requestHeaders) }}</pre>
          </div>

          <div class="network-detail__section">
            <h4>响应头</h4>
            <pre class="network-detail__pre">{{ formatJson(selectedItem.responseHeaders) }}</pre>
          </div>

          <div v-if="selectedItem.requestData" class="network-detail__section">
            <h4>请求数据</h4>
            <pre class="network-detail__pre">{{ formatRequestData(selectedItem.requestData) }}</pre>
          </div>

          <div v-if="selectedItem.responseData" class="network-detail__section">
            <h4>响应数据</h4>
            <pre class="network-detail__pre">{{ formatResponseData(selectedItem.responseData) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { networkList } from '../core/network'
import type { NetworkItem } from '../types'
import { formatTime, formatDuration, formatJson } from '../utils'

const selectedItem = ref<NetworkItem | null>(null)

function getShortUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname + urlObj.search
    return path.length > 50 ? path.substring(0, 47) + '...' : path
  } catch (e) {
    return url.length > 50 ? url.substring(0, 47) + '...' : url
  }
}

function getStatusClass(status: number | null): string {
  if (!status) return ''
  if (status >= 200 && status < 300) return 'network-item__status--success'
  if (status >= 300 && status < 400) return 'network-item__status--redirect'
  if (status >= 400 && status < 500) return 'network-item__status--client-error'
  if (status >= 500) return 'network-item__status--server-error'
  return ''
}

function selectItem(item: NetworkItem) {
  selectedItem.value = item
}

function closeDetail() {
  selectedItem.value = null
}

function formatRequestData(data: any): string {
  if (!data) return '无'

  if (typeof data === 'string') {
    try {
      return formatJson(JSON.parse(data))
    } catch (e) {
      return data
    }
  }

  return formatJson(data)
}

function formatResponseData(data: any): string {
  if (!data) return '无'

  if (typeof data === 'string') {
    try {
      return formatJson(JSON.parse(data))
    } catch (e) {
      return data.length > 1000 ? data.substring(0, 1000) + '...' : data
    }
  }

  return formatJson(data)
}
</script>

<style scoped>
.network-panel {
  height: 100%;
  overflow-y: auto;
  padding: 6px;
}

.network-panel__empty {
  padding: 40px 16px;
  text-align: center;
  color: #999;
}

.network-item {
  margin-bottom: 6px;
  padding: 10px;
  border-radius: 4px;
  background: var(--vc-bg);
  border-left: 3px solid #ccc;
}

.network-item--pending {
  border-left-color: #1890ff;
}

.network-item--success {
  border-left-color: #52c41a;
}

.network-item--error {
  border-left-color: #f5222d;
}

.network-item__header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.network-item__method,
.network-item__status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  color: #fff;
  background: #666;
}

.network-item__method--get,
.network-item__status--success {
  background: #52c41a;
}

.network-item__method--post,
.network-item__status--redirect {
  background: #1890ff;
}

.network-item__method--put {
  background: #faad14;
}

.network-item__method--delete,
.network-item__status--client-error,
.network-item__status--server-error {
  background: #f5222d;
}

.network-item__url {
  flex: 1;
  font-family: monospace;
  font-size: 12px;
  color: var(--vc-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.network-item__info {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #999;
}

.network-item__time,
.network-item__duration {
  font-family: monospace;
}

.network-item__duration {
  color: var(--vc-primary);
}

.network-detail {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 100;
}

.network-detail__content {
  background: var(--vc-bg);
  border-radius: 8px;
  width: 100%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
}

.network-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--vc-border);
}

.network-detail__header h3 {
  margin: 0;
  font-size: 15px;
  color: var(--vc-text);
}

.network-detail__header button {
  border: none;
  background: transparent;
  font-size: 20px;
  color: var(--vc-text);
  padding: 4px;
}

.network-detail__body {
  overflow-y: auto;
  padding: 12px;
}

.network-detail__section {
  margin-bottom: 16px;
}

.network-detail__section h4 {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--vc-primary);
}

.network-detail__info {
  font-size: 12px;
  line-height: 1.6;
}

.network-detail__pre {
  background: var(--vc-log-bg);
  padding: 10px;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--vc-text);
}
</style>
