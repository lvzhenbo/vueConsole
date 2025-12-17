import { defineConfig } from 'tsdown'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // 禁用 DTS 生成，使用单独的 vue-tsc
  clean: true,
  outDir: 'dist',
  outExtension: () => ({ js: '.js' }),
  external: ['vue'],
  plugins: [
    vue() as any
  ]
})
