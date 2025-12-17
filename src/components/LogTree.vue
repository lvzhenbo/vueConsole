<template>
  <div class="log-tree" :class="{ 'log-tree--root': isRoot }">
    <!-- 循环引用检测 -->
    <template v-if="isCircular">
      <span class="log-value log-value--circular">[Circular Reference]</span>
    </template>
    
    <!-- 简单值直接显示 -->
    <template v-else-if="!isExpandable">
      <span class="log-value" :class="valueClass" v-html="formattedValue"></span>
    </template>
    
    <!-- 可展开的对象/数组 -->
    <template v-else>
      <div class="log-tree__header" @click="toggle" @contextmenu.prevent="copyValue">
        <span class="log-tree__toggle">{{ isExpanded ? '▼' : '▶' }}</span>
        <span class="log-tree__preview" :class="previewClass">
          {{ preview }}
        </span>
        <span v-if="isRoot" class="log-tree__copy" @click.stop="copyValue" title="复制 JSON">📋</span>
      </div>
      
      <div v-if="isExpanded" class="log-tree__content">
        <!-- 数组元素 -->
        <template v-if="isArray">
          <div 
            v-for="(item, index) in displayedItems" 
            :key="index" 
            class="log-tree__item"
          >
            <span class="log-tree__key log-tree__key--index">{{ index }}</span>
            <span class="log-tree__colon">: </span>
            <LogTree 
              :value="item" 
              :depth="depth + 1" 
              :max-depth="maxDepth"
              :expanded-paths="expandedPaths"
              :path="`${path}[${index}]`"
              :ancestors="currentAncestors"
              @toggle-path="$emit('toggle-path', $event)"
            />
          </div>
          <!-- 数组长度属性 -->
          <div class="log-tree__item log-tree__item--proto">
            <span class="log-tree__key">length</span>
            <span class="log-tree__colon">: </span>
            <span class="log-value log-value--number">{{ dataValue.length }}</span>
          </div>
        </template>
        
        <!-- 对象属性 -->
        <template v-else-if="isObject">
          <!-- 可枚举属性 -->
          <div 
            v-for="key in displayedKeys" 
            :key="key" 
            class="log-tree__item"
          >
            <span class="log-tree__key">{{ formatKey(key) }}</span>
            <span class="log-tree__colon">: </span>
            <LogTree 
              :value="getPropertyValue(key)" 
              :depth="depth + 1" 
              :max-depth="maxDepth"
              :expanded-paths="expandedPaths"
              :path="`${path}.${key}`"
              :ancestors="currentAncestors"
              @toggle-path="$emit('toggle-path', $event)"
            />
          </div>
          
          <!-- Symbol 属性 -->
          <div 
            v-for="sym in symbolKeys" 
            :key="sym.toString()" 
            class="log-tree__item log-tree__item--symbol"
          >
            <span class="log-tree__key log-tree__key--symbol">{{ formatSymbol(sym) }}</span>
            <span class="log-tree__colon">: </span>
            <LogTree 
              :value="getSymbolValue(sym)" 
              :depth="depth + 1" 
              :max-depth="maxDepth"
              :expanded-paths="expandedPaths"
              :path="`${path}[${sym.toString()}]`"
              :ancestors="currentAncestors"
              @toggle-path="$emit('toggle-path', $event)"
            />
          </div>
          
          <!-- __proto__ -->
          <div v-if="showProto && protoValue" class="log-tree__item log-tree__item--proto">
            <span class="log-tree__key log-tree__key--proto">[[Prototype]]</span>
            <span class="log-tree__colon">: </span>
            <LogTree 
              :value="protoValue" 
              :depth="depth + 1" 
              :max-depth="maxDepth"
              :expanded-paths="expandedPaths"
              :path="`${path}.__proto__`"
              :ancestors="currentAncestors"
              @toggle-path="$emit('toggle-path', $event)"
            />
          </div>
        </template>
        
        <!-- 加载更多 -->
        <div 
          v-if="hasMore" 
          class="log-tree__more"
          @click.stop="loadMore"
        >
          显示更多 ({{ remainingCount }} 项)
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRaw } from 'vue'
import { escapeHtml } from '../utils'

const props = withDefaults(defineProps<{
  value: any
  depth?: number
  maxDepth?: number
  isRoot?: boolean
  expandedPaths?: Set<string>
  path?: string
  showProto?: boolean
  ancestors?: any[]  // 用于循环引用检测的祖先对象数组
}>(), {
  depth: 0,
  maxDepth: 10,
  isRoot: false,
  path: 'root',
  showProto: false
})

const emit = defineEmits<{
  'toggle-path': [path: string]
}>()

// 分页相关
const PAGE_SIZE = 100
const currentPage = ref(1)

// 获取原始值，避免 Vue 响应式代理干扰
const dataValue = computed(() => {
  try {
    return toRaw(props.value)
  } catch {
    return props.value
  }
})

// 循环引用检测
const isCircular = computed(() => {
  const val = dataValue.value
  if (val === null || typeof val !== 'object') return false
  if (!props.ancestors) return false
  return props.ancestors.includes(val)
})

// 当前祖先数组（包含当前对象）
const currentAncestors = computed(() => {
  const val = dataValue.value
  const newAncestors = props.ancestors ? [...props.ancestors] : []
  if (val && typeof val === 'object' && !isCircular.value) {
    newAncestors.push(val)
  }
  return newAncestors
})

// 是否展开
const isExpanded = computed(() => {
  return props.expandedPaths?.has(props.path) || false
})

// 切换展开状态
function toggle() {
  emit('toggle-path', props.path)
}

// 复制值到剪贴板
function copyValue() {
  try {
    const val = dataValue.value
    let text: string
    
    // 特殊类型处理
    if (val instanceof Map) {
      text = JSON.stringify(Array.from(val.entries()), getCircularReplacer(), 2)
    } else if (val instanceof Set) {
      text = JSON.stringify(Array.from(val), getCircularReplacer(), 2)
    } else if (val instanceof Error) {
      text = JSON.stringify({ name: val.name, message: val.message, stack: val.stack }, null, 2)
    } else if (typeof val === 'function') {
      text = val.toString()
    } else if (typeof val === 'symbol') {
      text = val.toString()
    } else {
      text = JSON.stringify(val, getCircularReplacer(), 2)
    }
    
    navigator.clipboard.writeText(text).then(() => {
      // 可以添加一个提示
    }).catch(() => {
      // 备用方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    })
  } catch (e) {
    console.error('复制失败:', e)
  }
}

// 处理循环引用的 JSON 替换器
function getCircularReplacer() {
  const seen = new WeakSet()
  return (_key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]'
      }
      seen.add(value)
    }
    return value
  }
}

// 判断类型
const valueType = computed(() => {
  const val = dataValue.value
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (Array.isArray(val)) return 'array'
  if (val instanceof Error) return 'error'
  if (val instanceof Date) return 'date'
  if (val instanceof RegExp) return 'regexp'
  if (val instanceof Map) return 'map'
  if (val instanceof Set) return 'set'
  if (val instanceof WeakMap) return 'weakmap'
  if (val instanceof WeakSet) return 'weakset'
  if (val instanceof Promise) return 'promise'
  if (typeof val === 'function') return 'function'
  if (typeof val === 'object') return 'object'
  if (typeof val === 'symbol') return 'symbol'
  return typeof val
})

const isArray = computed(() => valueType.value === 'array')
const isObject = computed(() => ['object', 'map', 'set', 'error', 'date', 'regexp'].includes(valueType.value))
const isExpandable = computed(() => {
  if (props.depth >= props.maxDepth) return false
  return isArray.value || isObject.value
})

// 获取对象键
const allKeys = computed(() => {
  if (!isObject.value && !isArray.value) return []
  try {
    const val = dataValue.value
    if (val instanceof Map) {
      return Array.from(val.keys()).map(k => String(k))
    }
    if (val instanceof Set) {
      return Array.from(val.keys()).map((_, i) => String(i))
    }
    return Object.keys(val)
  } catch {
    return []
  }
})

// Symbol 键
const symbolKeys = computed(() => {
  if (!isObject.value) return []
  try {
    return Object.getOwnPropertySymbols(dataValue.value)
  } catch {
    return []
  }
})

// 分页显示的键
const displayedKeys = computed(() => {
  const total = currentPage.value * PAGE_SIZE
  return allKeys.value.slice(0, total)
})

// 分页显示的数组项
const displayedItems = computed(() => {
  if (!isArray.value) return []
  const total = currentPage.value * PAGE_SIZE
  return dataValue.value.slice(0, total)
})

// 是否有更多
const hasMore = computed(() => {
  if (isArray.value) {
    return dataValue.value.length > currentPage.value * PAGE_SIZE
  }
  return allKeys.value.length > currentPage.value * PAGE_SIZE
})

// 剩余数量
const remainingCount = computed(() => {
  if (isArray.value) {
    return dataValue.value.length - currentPage.value * PAGE_SIZE
  }
  return allKeys.value.length - currentPage.value * PAGE_SIZE
})

// 加载更多
function loadMore() {
  currentPage.value++
}

// 获取 __proto__
const protoValue = computed(() => {
  try {
    return Object.getPrototypeOf(dataValue.value)
  } catch {
    return null
  }
})

// 获取属性值
function getPropertyValue(key: string): any {
  try {
    const val = dataValue.value
    if (val instanceof Map) {
      return val.get(key)
    }
    if (val instanceof Set) {
      return Array.from(val)[parseInt(key)]
    }
    return val[key]
  } catch (e) {
    return `[Error: ${e}]`
  }
}

// 获取 Symbol 属性值
function getSymbolValue(sym: symbol): any {
  try {
    return dataValue.value[sym]
  } catch (e) {
    return `[Error: ${e}]`
  }
}

// 格式化键名
function formatKey(key: string): string {
  // 判断是否需要引号
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return key
  }
  return `"${escapeHtml(key)}"`
}

// 格式化 Symbol
function formatSymbol(sym: symbol): string {
  return sym.toString()
}

// 预览文本
const preview = computed(() => {
  const val = dataValue.value
  
  if (isArray.value) {
    const len = val.length
    if (len === 0) return 'Array(0) []'
    const items = val.slice(0, 5).map((item: any) => getPreviewValue(item))
    const suffix = len > 5 ? `, ... (${len - 5} more)` : ''
    return `Array(${len}) [${items.join(', ')}${suffix}]`
  }
  
  if (val instanceof Map) {
    return `Map(${val.size})`
  }
  
  if (val instanceof Set) {
    return `Set(${val.size})`
  }
  
  if (val instanceof Date) {
    return val.toString()
  }
  
  if (val instanceof RegExp) {
    return val.toString()
  }
  
  if (val instanceof Error) {
    return `${val.name}: ${val.message}`
  }
  
  // 普通对象
  const keys = allKeys.value
  const constructorName = val?.constructor?.name || 'Object'
  if (keys.length === 0) return `${constructorName} {}`
  
  const items = keys.slice(0, 3).map(key => {
    const v = getPreviewValue(getPropertyValue(key))
    return `${key}: ${v}`
  })
  const suffix = keys.length > 3 ? ', ...' : ''
  return `${constructorName} {${items.join(', ')}${suffix}}`
})

// 获取预览值
function getPreviewValue(val: any): string {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'string') return `"${val.length > 20 ? val.slice(0, 20) + '...' : val}"`
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  if (typeof val === 'function') return `ƒ ${val.name || 'anonymous'}`
  if (typeof val === 'symbol') return val.toString()
  if (Array.isArray(val)) return `Array(${val.length})`
  if (val instanceof Date) return val.toISOString()
  if (val instanceof RegExp) return val.toString()
  if (val instanceof Map) return `Map(${val.size})`
  if (val instanceof Set) return `Set(${val.size})`
  if (val instanceof Error) return `${val.name}`
  return '{...}'
}

// 格式化简单值
const formattedValue = computed(() => {
  const val = dataValue.value
  
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  
  if (typeof val === 'string') {
    const escaped = escapeHtml(val)
    return `"${escaped}"`
  }
  
  if (typeof val === 'number') return String(val)
  if (typeof val === 'boolean') return String(val)
  if (typeof val === 'bigint') return `${val}n`
  if (typeof val === 'symbol') return val.toString()
  
  if (typeof val === 'function') {
    const name = val.name || 'anonymous'
    const fnStr = val.toString()
    // 简化显示
    if (fnStr.length > 100) {
      return `<span class="log-value--function-keyword">ƒ</span> ${escapeHtml(name)}()`
    }
    return `<span class="log-value--function-keyword">ƒ</span> ${escapeHtml(fnStr.slice(0, 100))}...`
  }
  
  if (val instanceof Date) return val.toString()
  if (val instanceof RegExp) return val.toString()
  
  // 深度超限时显示简短预览
  if (props.depth >= props.maxDepth) {
    return preview.value
  }
  
  return String(val)
})

// 值的样式类
const valueClass = computed(() => {
  return `log-value--${valueType.value}`
})

// 预览样式类
const previewClass = computed(() => {
  if (isArray.value) return 'log-tree__preview--array'
  return 'log-tree__preview--object'
})
</script>

<style scoped>
.log-tree { display: inline; font-family: monospace; font-size: 12px; line-height: 1.4; }
.log-tree--root { display: block; }
.log-tree__header { display: inline-flex; align-items: flex-start; }
.log-tree__toggle { width: 12px; font-size: 10px; color: #727272; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; }
.log-tree__preview { color: #5e5e5e; word-break: break-all; }
.log-tree__preview--array, .log-tree__preview--object { color: #0d6efd; }
.log-tree__copy { margin-left: 8px; font-size: 12px; }
.log-tree__content { display: block; margin-left: 10px; padding-left: 6px; border-left: 1px dashed #ddd; }
.log-tree__item { display: block; padding: 1px 0; }
.log-tree__item--proto { opacity: .6; }
.log-tree__key { color: #9e3379; }
.log-tree__key--index { color: #1a1aa6; }
.log-tree__key--symbol { color: #8250df; }
.log-tree__key--proto { color: #727272; font-style: italic; }
.log-tree__colon { color: #727272; }
.log-tree__more { padding: 4px 8px; margin: 4px 0; color: #0d6efd; font-size: 11px; background: rgba(13,110,253,.05); border-radius: 4px; display: inline-block; }
:deep(.log-value) { color: #333; }
:deep(.log-value--null), :deep(.log-value--undefined) { color: #727272; font-style: italic; }
:deep(.log-value--string) { color: #c41a16; }
:deep(.log-value--number), :deep(.log-value--bigint) { color: #1a1aa6; }
:deep(.log-value--boolean) { color: #0d6efd; font-weight: 600; }
:deep(.log-value--function) { color: #795da3; }
:deep(.log-value--function-keyword) { color: #0d6efd; font-style: italic; }
:deep(.log-value--symbol) { color: #8250df; }
:deep(.log-value--date), :deep(.log-value--regexp) { color: #c41a16; }
:deep(.log-value--error) { color: #dc3545; }
:deep(.log-value--circular) { color: #ff6b6b; font-style: italic; }
:global(.vue-console--dark) .log-tree__toggle { color: #9e9e9e; }
:global(.vue-console--dark) .log-tree__preview { color: #b0b0b0; }
:global(.vue-console--dark) .log-tree__preview--array, :global(.vue-console--dark) .log-tree__preview--object { color: #79c0ff; }
:global(.vue-console--dark) .log-tree__content { border-left-color: #444; }
:global(.vue-console--dark) .log-tree__key { color: #e676d8; }
:global(.vue-console--dark) .log-tree__key--index { color: #79c0ff; }
:global(.vue-console--dark) .log-tree__colon { color: #b0b0b0; }
:global(.vue-console--dark) .log-tree__more { color: #58a6ff; background: rgba(88,166,255,.1); }
:global(.vue-console--dark) :deep(.log-value) { color: #d4d4d4; }
:global(.vue-console--dark) :deep(.log-value--null), :global(.vue-console--dark) :deep(.log-value--undefined) { color: #808080; }
:global(.vue-console--dark) :deep(.log-value--string) { color: #ce9178; }
:global(.vue-console--dark) :deep(.log-value--number), :global(.vue-console--dark) :deep(.log-value--bigint) { color: #b5cea8; }
:global(.vue-console--dark) :deep(.log-value--boolean) { color: #569cd6; }
:global(.vue-console--dark) :deep(.log-value--function) { color: #dcdcaa; }
:global(.vue-console--dark) :deep(.log-value--date), :global(.vue-console--dark) :deep(.log-value--regexp) { color: #ce9178; }
:global(.vue-console--dark) :deep(.log-value--error) { color: #f48771; }
:global(.vue-console--dark) :deep(.log-value--circular) { color: #ff8a8a; }
</style>
