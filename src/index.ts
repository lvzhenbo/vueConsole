// VueConsole 主入口文件
import { createApp, App as VueApp } from 'vue'
import VueConsole from './components/VueConsole.vue'
import type { VueConsoleOptions } from './types'

export type { VueConsoleOptions } from './types'

// VueConsole类
export class VConsole {
  private app: VueApp | null = null
  private container: HTMLElement | null = null
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

  private init() {
    // 创建容器
    this.container = document.createElement('div')
    this.container.id = 'vue-console-container'
    document.body.appendChild(this.container)

    // 创建Vue应用
    this.app = createApp(VueConsole, {
      defaultTheme: this.options.theme
    })

    // 挂载
    this.app.mount(this.container)
  }

  // 显示控制台
  public show() {
    // 通过事件或其他方式触发显示
    console.log('VueConsole: show')
  }

  // 隐藏控制台
  public hide() {
    console.log('VueConsole: hide')
  }

  // 销毁控制台
  public destroy() {
    if (this.app) {
      this.app.unmount()
      this.app = null
    }

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
      this.container = null
    }
  }
}

// 默认导出
export default VConsole

// Vue插件安装方法
export const install = (app: VueApp, options: VueConsoleOptions = {}) => {
  // 创建VueConsole实例
  const vConsole = new VConsole(options)
  
  // 将实例添加到app的全局属性
  app.config.globalProperties.$vConsole = vConsole
}

// 导出组件
export { VueConsole }
