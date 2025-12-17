<template>
  <div class="element-panel">
    <div class="element-panel__toolbar">
      <button @click="refreshDom">刷新DOM</button>
      <button @click="expandAll">展开全部</button>
      <button @click="collapseAll">收起全部</button>
    </div>

    <div class="element-panel__tree">
      <TreeNode v-if="rootNode" :node="rootNode" :level="0" :expanded-nodes="expandedNodes" @toggle="toggleNode"
        @select="selectNode" />
    </div>

    <!-- 元素详情 -->
    <div v-if="selectedElement" class="element-detail">
      <div class="element-detail__header">
        <h4>元素详情</h4>
        <button @click="selectedElement = null">✕</button>
      </div>
      <div class="element-detail__content">
        <div class="element-detail__section">
          <strong>标签:</strong> {{ selectedElement.tagName }}
        </div>
        <div v-if="selectedElement.id" class="element-detail__section">
          <strong>ID:</strong> {{ selectedElement.id }}
        </div>
        <div v-if="selectedElement.className" class="element-detail__section">
          <strong>类名:</strong> {{ selectedElement.className }}
        </div>
        <div v-if="selectedElement.textContent && selectedElement.textContent.trim()" class="element-detail__section">
          <strong>文本:</strong>
          <div class="element-detail__text">{{ selectedElement.textContent.trim() }}</div>
        </div>
        <div v-if="Object.keys(selectedElement.attributes).length" class="element-detail__section">
          <strong>属性:</strong>
          <div class="element-detail__attrs">
            <div v-for="(value, name) in selectedElement.attributes" :key="name">
              {{ name }}="{{ value }}"
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TreeNode from '../components/TreeNode.vue'

interface DomNode {
  tagName: string
  id?: string
  className?: string
  textContent?: string
  attributes: Record<string, string>
  children: DomNode[]
  element?: Element
}

const rootNode = ref<DomNode | null>(null)
const expandedNodes = ref<Set<DomNode>>(new Set())
const selectedElement = ref<DomNode | null>(null)

// 忽略的标签
const ignoredTags = ['SCRIPT', 'STYLE', 'LINK', 'META']

function buildDomTree(element: Element): DomNode | null {
  // 忽略VueConsole自身的DOM
  if (element.classList?.contains('vue-console')) {
    return null
  }

  if (ignoredTags.includes(element.tagName)) {
    return null
  }

  const firstChild = element.childNodes[0]
  const node: DomNode = {
    tagName: element.tagName.toLowerCase(),
    id: element.id,
    className: element.className,
    textContent: element.childNodes.length === 1 && firstChild?.nodeType === 3
      ? firstChild?.textContent || ''
      : '',
    attributes: {},
    children: [],
    element
  }

  // 获取属性
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    if (attr && attr.name !== 'id' && attr.name !== 'class') {
      node.attributes[attr.name] = attr.value
    }
  }

  // 递归构建子节点
  for (let i = 0; i < element.children.length; i++) {
    const childElement = element.children[i]
    if (!childElement) continue
    const child = buildDomTree(childElement)
    if (child) {
      node.children.push(child)
    }
  }

  return node
}

function refreshDom() {
  rootNode.value = buildDomTree(document.documentElement)
  // 默认展开根节点
  if (rootNode.value) {
    expandedNodes.value.add(rootNode.value)
  }
}

function expandAll() {
  const expand = (node: DomNode) => {
    expandedNodes.value.add(node)
    node.children.forEach(expand)
  }
  if (rootNode.value) {
    expand(rootNode.value)
  }
}

function collapseAll() {
  expandedNodes.value.clear()
  if (rootNode.value) {
    expandedNodes.value.add(rootNode.value)
  }
}

function toggleNode(node: DomNode) {
  if (expandedNodes.value.has(node)) {
    expandedNodes.value.delete(node)
  } else {
    expandedNodes.value.add(node)
  }
}

function selectNode(node: DomNode) {
  selectedElement.value = node
  // 高亮实际元素
  if (node.element) {
    node.element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

onMounted(() => {
  refreshDom()
})
</script>

<style scoped>
.element-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.element-panel__toolbar {
  display: flex;
  gap: 6px;
  padding: 6px;
  border-bottom: 1px solid var(--vc-border);
  background: var(--vc-bg);
}

.element-panel__toolbar button {
  padding: 5px 10px;
  border: 1px solid var(--vc-border);
  background: var(--vc-bg);
  color: var(--vc-text);
  border-radius: 4px;
  font-size: 12px;
}

.element-panel__tree {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  font-family: monospace;
  font-size: 12px;
}

.element-detail {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 50%;
  background: var(--vc-bg);
  border-top: 2px solid var(--vc-primary);
  display: flex;
  flex-direction: column;
}

.element-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid var(--vc-border);
}

.element-detail__header h4 {
  margin: 0;
  font-size: 13px;
  color: var(--vc-text);
}

.element-detail__header button {
  border: none;
  background: transparent;
  font-size: 18px;
  color: var(--vc-text);
  padding: 4px;
}

.element-detail__content {
  overflow-y: auto;
  padding: 10px;
  font-size: 12px;
}

.element-detail__section {
  margin-bottom: 10px;
  line-height: 1.5;
}

.element-detail__text,
.element-detail__attrs {
  margin-top: 4px;
  padding: 6px;
  background: var(--vc-log-bg);
  border-radius: 4px;
  word-break: break-all;
}

.element-detail__attrs {
  font-family: monospace;
}
</style>
