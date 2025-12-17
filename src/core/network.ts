// 网络请求拦截器
import { ref } from 'vue'
import type { NetworkItem } from '../types'
import { generateId } from '../utils'

// 网络请求列表
export const networkList = ref<NetworkItem[]>([])

// 最大请求数量
const MAX_NETWORK_NUMBER = 1000

// 清空网络请求
export function clearNetwork() {
  networkList.value = []
}

// 添加网络请求
function addNetworkItem(item: NetworkItem) {
  networkList.value.push(item)
  
  // 限制数量
  if (networkList.value.length > MAX_NETWORK_NUMBER) {
    networkList.value.shift()
  }
}

// 更新网络请求
function updateNetworkItem(id: string, updates: Partial<NetworkItem>) {
  const item = networkList.value.find(item => item.id === id)
  if (item) {
    Object.assign(item, updates)
  }
}

// 解析请求头
function parseHeaders(headers: Headers | Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      result[key] = value
    })
  } else {
    Object.assign(result, headers)
  }
  
  return result
}

// 拦截XMLHttpRequest
export function hookXHR() {
  const OriginalXHR = window.XMLHttpRequest
  
  if (!OriginalXHR) return
  
  const ProxyXHR = function(this: any) {
    const xhr = new OriginalXHR()
    const id = generateId()
    
    let requestTime = 0
    let url = ''
    let method = 'GET'
    
    // 拦截open方法
    const originalOpen = xhr.open
    xhr.open = function(this: XMLHttpRequest, ...args: any[]) {
      method = args[0]?.toUpperCase() || 'GET'
      url = args[1] || ''
      return originalOpen.apply(this, args as any)
    }
    
    // 拦截send方法
    const originalSend = xhr.send
    xhr.send = function(this: XMLHttpRequest, body?: any) {
      requestTime = Date.now()
      
      // 创建网络请求项
      const item: NetworkItem = {
        id,
        url,
        method: method as any,
        status: null,
        statusText: '',
        requestTime,
        responseTime: null,
        duration: null,
        requestHeaders: {},
        responseHeaders: {},
        requestData: body,
        responseData: null,
        requestType: typeof body,
        responseType: '',
        readyState: 'pending'
      }
      
      addNetworkItem(item)
      
      // 监听状态变化
      const originalOnReadyStateChange = xhr.onreadystatechange
      xhr.onreadystatechange = function(this: XMLHttpRequest, ...args: any[]) {
        if (xhr.readyState === 4) {
          const responseTime = Date.now()
          const duration = responseTime - requestTime
          
          // 获取响应头
          const responseHeaders: Record<string, string> = {}
          const headerStr = xhr.getAllResponseHeaders()
          if (headerStr) {
            headerStr.split('\n').forEach(line => {
              const [key, ...valueParts] = line.split(':')
              if (key) {
                responseHeaders[key.trim()] = valueParts.join(':').trim()
              }
            })
          }
          
          updateNetworkItem(id, {
            status: xhr.status,
            statusText: xhr.statusText,
            responseTime,
            duration,
            responseHeaders,
            responseData: xhr.response,
            responseType: xhr.responseType || 'text',
            readyState: xhr.status >= 200 && xhr.status < 300 ? 'success' : 'error'
          })
        }
        
        if (originalOnReadyStateChange) {
          return originalOnReadyStateChange.apply(this, args as any)
        }
      }
      
      return originalSend.call(this, body)
    }
    
    return xhr
  }
  
  // 替换XMLHttpRequest
  window.XMLHttpRequest = ProxyXHR as any
}

// 拦截fetch
export function hookFetch() {
  const originalFetch = window.fetch
  
  if (!originalFetch) return
  
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const id = generateId()
    const requestTime = Date.now()
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const method = init?.method?.toUpperCase() || 'GET'
    
    // 创建网络请求项
    const item: NetworkItem = {
      id,
      url,
      method: method as any,
      status: null,
      statusText: '',
      requestTime,
      responseTime: null,
      duration: null,
      requestHeaders: init?.headers ? parseHeaders(init.headers as any) : {},
      responseHeaders: {},
      requestData: init?.body,
      responseData: null,
      requestType: typeof init?.body,
      responseType: '',
      readyState: 'pending'
    }
    
    addNetworkItem(item)
    
    // 调用原始fetch
    return originalFetch(input, init)
      .then(async (response) => {
        const responseTime = Date.now()
        const duration = responseTime - requestTime
        
        // 克隆响应以便读取
        const clonedResponse = response.clone()
        let responseData: any = null
        
        try {
          const contentType = response.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            responseData = await clonedResponse.json()
          } else {
            responseData = await clonedResponse.text()
          }
        } catch (e) {
          responseData = null
        }
        
        updateNetworkItem(id, {
          status: response.status,
          statusText: response.statusText,
          responseTime,
          duration,
          responseHeaders: parseHeaders(response.headers),
          responseData,
          responseType: response.headers.get('content-type') || '',
          readyState: response.ok ? 'success' : 'error'
        })
        
        return response
      })
      .catch((error) => {
        const responseTime = Date.now()
        const duration = responseTime - requestTime
        
        updateNetworkItem(id, {
          responseTime,
          duration,
          readyState: 'error',
          responseData: error.message
        })
        
        throw error
      })
  }
}

// 开启网络拦截
export function hookNetwork() {
  hookXHR()
  hookFetch()
}
