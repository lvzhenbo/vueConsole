// VueConsole 主入口文件 - 自定义元素版本
import { defineCustomElement, type App as VueApp, type Component } from 'vue'
import VueConsoleComponent from './components/VueConsole.vue'
import LogPanel from './panels/LogPanel.vue'
import NetworkPanel from './panels/NetworkPanel.vue'
import ElementPanel from './panels/ElementPanel.vue'
import StoragePanel from './panels/StoragePanel.vue'
import SystemPanel from './panels/SystemPanel.vue'
import LogTree from './components/LogTree.vue'
import TreeNode from './components/TreeNode.vue'
import type { VueConsoleOptions } from './types'

export type { VueConsoleOptions } from './types'

// 收集所有组件的样式
function collectStyles(components: Component[]): string[] {
  const styles: string[] = []
  for (const comp of components) {
    if ((comp as any).styles) {
      styles.push(...(comp as any).styles)
    }
  }
  return styles
}

// 所有子组件列表（用于收集样式）
const childComponents = [
  LogPanel,
  NetworkPanel,
  ElementPanel,
  StoragePanel,
  SystemPanel,
  LogTree,
  TreeNode
]

// 创建带有合并样式的自定义元素
function createVueConsoleElement() {
  // 收集所有子组件样式
  const allStyles = [
    ...((VueConsoleComponent as any).styles || []),
    ...collectStyles(childComponents)
  ]

  // 使用 defineCustomElement 并传入合并的样式
  return defineCustomElement(VueConsoleComponent, {
    styles: allStyles
  })
}

// 自定义元素实例接口
interface VueConsoleElementInstance extends HTMLElement {
  _instance?: {
    exposed?: {
      show?: () => void
      hide?: () => void
      toggleTheme?: () => void
      clearCurrentPanel?: () => void
    }
  }
}

// 定义自定义元素类（延迟创建）
let VueConsoleElement: ReturnType<typeof createVueConsoleElement> | null = null

function getVueConsoleElement() {
  if (!VueConsoleElement) {
    VueConsoleElement = createVueConsoleElement()
  }
  return VueConsoleElement
}

// VueConsole类 - 使用自定义元素实现
export class VConsole {
  private element: VueConsoleElementInstance | null = null
  private options: VueConsoleOptions

  constructor(options: VueConsoleOptions = {}) {
    this.options = {
      theme: 'light',
      defaultPlugins: ['log', 'system', 'network', 'element', 'storage'],
      maxLogNumber: 1000,
      disableLogScrolling: false,
      ...options
    }

    this.init()
  }

  // 获取目标挂载元素
  private getTargetElement(): HTMLElement {
    const { target } = this.options
    
    if (!target) {
      return document.body
    }
    
    if (typeof target === 'string') {
      const element = document.querySelector(target)
      if (element instanceof HTMLElement) {
        return element
      }
      console.warn(`VueConsole: target element "${target}" not found, falling back to document.body`)
      return document.body
    }
    
    return target
  }

  private init() {
    const Element = getVueConsoleElement()
    
    // 注册自定义元素（如果尚未注册）
    if (!customElements.get('vue-console')) {
      customElements.define('vue-console', Element)
    }

    // 获取目标挂载元素
    const targetElement = this.getTargetElement()

    // 创建自定义元素实例
    this.element = document.createElement('vue-console') as VueConsoleElementInstance
    
    // 设置属性
    this.element.setAttribute('default-theme', this.options.theme || 'light')
    
    // 添加到 DOM
    targetElement.appendChild(this.element)
  }

  // 显示控制台
  public show() {
    if (this.element?._instance?.exposed?.show) {
      this.element._instance.exposed.show()
    }
  }

  // 隐藏控制台
  public hide() {
    if (this.element?._instance?.exposed?.hide) {
      this.element._instance.exposed.hide()
    }
  }

  // 切换主题
  public toggleTheme() {
    if (this.element?._instance?.exposed?.toggleTheme) {
      this.element._instance.exposed.toggleTheme()
    }
  }

  // 销毁控制台
  public destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
      this.element = null
    }
  }
}

// 默认导出
export default VConsole

// Vue插件安装方法
export const install = (app: VueApp, options: VueConsoleOptions = {}) => {
  const vConsole = new VConsole(options)
  app.config.globalProperties.$vConsole = vConsole
}

// 导出组件
export { VueConsoleComponent as VueConsole }

// 导出自定义元素类
export { getVueConsoleElement as createVueConsoleElement }

// 注册自定义元素的便捷函数
export function register(tagName = 'vue-console') {
  const Element = getVueConsoleElement()
  if (!customElements.get(tagName)) {
    customElements.define(tagName, Element)
  }
  return Element
}
