import { defineConfig } from 'tsdown'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // Vue SFC 的类型定义需要使用 vue-tsc 单独生成
  clean: true,
  outDir: 'dist',
  external: ['vue'],
  plugins: [
    vue() as any
  ]
})
