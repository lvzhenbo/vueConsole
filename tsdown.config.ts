import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'neutral',
  clean: true,
  outDir: 'dist',
  plugins: [
    Vue({
      isProduction: true,
      // 启用自定义元素模式：样式会内联到组件的 styles 属性
      customElement: /src\/.*\.vue$/
    })
  ],
  dts: { vue: true, tsconfig: 'tsconfig.app.json' },
})
