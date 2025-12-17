// 工具函数

// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// 格式化时间
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')
  return `${hours}:${minutes}:${seconds}.${milliseconds}`
}

// 格式化数据大小
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 格式化持续时间
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

// 获取数据类型
export function getType(value: any): string {
  const type = Object.prototype.toString.call(value).slice(8, -1)
  return type
}

// 判断是否为对象
export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object'
}

// 判断是否为数组
export function isArray(value: any): boolean {
  return Array.isArray(value)
}

// 判断是否为函数
export function isFunction(value: any): boolean {
  return typeof value === 'function'
}

// 深度克隆
export function deepClone<T>(obj: T): T {
  if (!isObject(obj)) return obj
  
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (e) {
    return obj
  }
}

// 转义HTML
export function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// 获取设备信息
export function getDeviceInfo() {
  const ua = navigator.userAgent
  const info: Record<string, any> = {
    '用户代理': ua,
    '屏幕分辨率': `${window.screen.width} × ${window.screen.height}`,
    '视口尺寸': `${window.innerWidth} × ${window.innerHeight}`,
    '设备像素比': window.devicePixelRatio,
    '语言': navigator.language,
    '在线状态': navigator.onLine ? '在线' : '离线',
    '平台': navigator.platform
  }
  
  // 检测浏览器
  if (ua.indexOf('Chrome') > -1) {
    info['浏览器'] = 'Chrome'
  } else if (ua.indexOf('Safari') > -1) {
    info['浏览器'] = 'Safari'
  } else if (ua.indexOf('Firefox') > -1) {
    info['浏览器'] = 'Firefox'
  } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
    info['浏览器'] = 'IE'
  } else {
    info['浏览器'] = '未知'
  }
  
  return info
}

// 获取存储信息
export function getStorageInfo() {
  const info: Record<string, any> = {}
  
  try {
    if (typeof localStorage !== 'undefined') {
      info['LocalStorage'] = `${localStorage.length} 项`
    }
  } catch (e) {
    info['LocalStorage'] = '不可用'
  }
  
  try {
    if (typeof sessionStorage !== 'undefined') {
      info['SessionStorage'] = `${sessionStorage.length} 项`
    }
  } catch (e) {
    info['SessionStorage'] = '不可用'
  }
  
  try {
    info['Cookies'] = document.cookie ? `${document.cookie.split(';').length} 项` : '0 项'
  } catch (e) {
    info['Cookies'] = '不可用'
  }
  
  return info
}

// 解析Cookie
export function parseCookies(): Array<{ key: string; value: string }> {
  const cookies: Array<{ key: string; value: string }> = []
  
  try {
    const cookieStr = document.cookie
    if (cookieStr) {
      cookieStr.split(';').forEach(cookie => {
        const [key, ...valueParts] = cookie.trim().split('=')
        if (key) {
          cookies.push({
            key: key.trim(),
            value: valueParts.join('=').trim()
          })
        }
      })
    }
  } catch (e) {
    console.error('解析Cookie失败:', e)
  }
  
  return cookies
}

// 格式化JSON
export function formatJson(obj: any, indent: number = 2): string {
  try {
    return JSON.stringify(obj, null, indent)
  } catch (e) {
    return String(obj)
  }
}

// 安全地执行代码
export function safeEval(code: string): any {
  try {
    // 使用Function构造器而不是eval，更安全
    const func = new Function('return ' + code)
    return func()
  } catch (e) {
    return e
  }
}
