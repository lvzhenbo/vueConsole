<template>
  <div class="tree-node">
    <div
      class="tree-node__content"
      :style="{ paddingLeft: `${level * 16}px` }"
      @click="handleClick"
    >
      <span v-if="node.children.length > 0" class="tree-node__toggle">
        {{ isExpanded ? '▼' : '▶' }}
      </span>
      <span v-else class="tree-node__toggle tree-node__toggle--empty">•</span>
      
      <span class="tree-node__tag">&lt;{{ node.tagName }}</span>
      <span v-if="node.id" class="tree-node__id">#{{ node.id }}</span>
      <span v-if="node.className" class="tree-node__class">.{{ node.className.split(' ').join('.') }}</span>
      <span class="tree-node__tag">&gt;</span>
      
      <span v-if="node.textContent && node.textContent.length < 50" class="tree-node__text">
        {{ node.textContent }}
      </span>
    </div>

    <template v-if="isExpanded && node.children.length > 0">
      <TreeNode
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
        :level="level + 1"
        :expanded-nodes="expandedNodes"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface DomNode {
  tagName: string
  id?: string
  className?: string
  textContent?: string
  attributes: Record<string, string>
  children: DomNode[]
  element?: Element
}

const props = defineProps<{
  node: DomNode
  level: number
  expandedNodes: Set<DomNode>
}>()

const emit = defineEmits<{
  toggle: [node: DomNode]
  select: [node: DomNode]
}>()

const isExpanded = computed(() => props.expandedNodes.has(props.node))

function handleClick() {
  if (props.node.children.length > 0) {
    emit('toggle', props.node)
  }
  emit('select', props.node)
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.tree-node__content {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.tree-node__content:hover {
  background: var(--hover-color);
}

.tree-node__toggle {
  width: 16px;
  margin-right: 4px;
  color: #999;
  font-size: 10px;
  flex-shrink: 0;
}

.tree-node__toggle--empty {
  opacity: 0.3;
}

.tree-node__tag {
  color: #881280;
  font-weight: bold;
}

.tree-node__id {
  color: #1c00cf;
  margin-left: 4px;
}

.tree-node__class {
  color: #994500;
  margin-left: 4px;
}

.tree-node__text {
  color: #000;
  margin-left: 8px;
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 深色主题 */
:deep(.vue-console--dark) .tree-node__tag {
  color: #e676d8;
}

:deep(.vue-console--dark) .tree-node__id {
  color: #9cdcfe;
}

:deep(.vue-console--dark) .tree-node__class {
  color: #dcdcaa;
}

:deep(.vue-console--dark) .tree-node__text {
  color: #d4d4d4;
}
</style>
