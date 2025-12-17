// 类型定义

// 日志级别
export type LogType = 'log' | 'info' | 'warn' | 'error' | 'debug'

// 日志项
export interface LogItem {
  id: string
  type: LogType
  content: any[]
  time: number
  repeated: number
}

// 网络请求方法
export type NetworkMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

// 网络请求状态
export type NetworkStatus = 'pending' | 'success' | 'error'

// 网络请求项
export interface NetworkItem {
  id: string
  url: string
  method: NetworkMethod
  status: number | null
  statusText: string
  requestTime: number
  responseTime: number | null
  duration: number | null
  requestHeaders: Record<string, string>
  responseHeaders: Record<string, string>
  requestData: any
  responseData: any
  requestType: string
  responseType: string
  readyState: NetworkStatus
}

// 存储项
export interface StorageItem {
  key: string
  value: string
}

// 面板类型
export type PanelType = 'log' | 'system' | 'network' | 'element' | 'storage'

// 面板配置
export interface PanelConfig {
  id: string
  name: string
  component: any
}

// VueConsole配置选项
export interface VueConsoleOptions {
  theme?: 'light' | 'dark'
  defaultPlugins?: string[]
  maxLogNumber?: number
  disableLogScrolling?: boolean
  target?: HTMLElement | string
}

// 系统信息
export interface SystemInfo {
  [key: string]: string | number | boolean
}

// 插件接口
export interface Plugin {
  id: string
  name: string
  component: any
  onReady?: () => void
  onShow?: () => void
  onHide?: () => void
  onRemove?: () => void
}
