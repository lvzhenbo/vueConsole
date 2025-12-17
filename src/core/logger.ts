// 日志收集器
import { ref } from 'vue'
import type { LogItem, LogType } from '../types'
import { generateId } from '../utils'

// 日志列表
export const logList = ref<LogItem[]>([])

// 最大日志数量
const MAX_LOG_NUMBER = 1000

// 原始console方法
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug
}

// 添加日志
export function addLog(type: LogType, args: any[]) {
  const lastLog = logList.value[logList.value.length - 1]
  
  // 检查是否是重复日志
  if (lastLog && lastLog.type === type && JSON.stringify(lastLog.content) === JSON.stringify(args)) {
    lastLog.repeated++
    return
  }
  
  const log: LogItem = {
    id: generateId(),
    type,
    content: args,
    time: Date.now(),
    repeated: 1
  }
  
  logList.value.push(log)
  
  // 限制日志数量
  if (logList.value.length > MAX_LOG_NUMBER) {
    logList.value.shift()
  }
}

// 清空日志
export function clearLogs() {
  logList.value = []
}

// 拦截console方法
export function hookConsole() {
  const methods: LogType[] = ['log', 'info', 'warn', 'error', 'debug']
  
  methods.forEach(method => {
    console[method] = function(...args: any[]) {
      // 调用原始方法
      originalConsole[method].apply(console, args)
      // 添加到日志列表
      addLog(method, args)
    }
  })
  
  // 拦截未捕获的错误
  window.addEventListener('error', (event) => {
    addLog('error', [event.error || event.message])
  })
  
  // 拦截未处理的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    addLog('error', ['Unhandled Promise Rejection:', event.reason])
  })
}

// 恢复原始console方法
export function unhookConsole() {
  const methods: LogType[] = ['log', 'info', 'warn', 'error', 'debug']
  
  methods.forEach(method => {
    console[method] = originalConsole[method]
  })
}

// 执行命令
export function executeCommand(command: string): any {
  try {
    // 使用eval执行命令，但在真实场景中应该更安全的方式
    const result = eval(command)
    addLog('log', ['>', command])
    addLog('log', [result])
    return result
  } catch (error) {
    addLog('error', [error])
    return error
  }
}
