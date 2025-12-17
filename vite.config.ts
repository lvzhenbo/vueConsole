import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 将 vue-console 标签视为自定义元素
          isCustomElement: (tag) => tag === 'vue-console'
        }
      },
      // 对 src 目录下的所有 .vue 文件启用自定义元素模式
      // 这会将样式内联到组件的 styles 属性中
      customElement: /src\/.*\.vue$/
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueConsole',
      formats: ['es'],
      fileName: () => 'index.js'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'index.css'
          return assetInfo.name || 'asset'
        }
      }
    },
    cssCodeSplit: false,
    emptyOutDir: true
  }
})
