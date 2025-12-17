import { createApp } from 'vue'
import App from './App.vue'
import VConsole from '../src/index'

// 创建Vue应用
const app = createApp(App)

// 初始化VueConsole（自定义元素模式，使用 Shadow DOM 隔离样式）
new VConsole({
  theme: 'light'
})

app.mount('#app')
