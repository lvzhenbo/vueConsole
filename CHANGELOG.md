# 更新日志

## [1.0.0] - 2025-12-17

### 新增功能

#### 🎯 核心功能
- ✨ 实现基于 Vue 3.5 + TypeScript 的移动端调试工具
- 🎨 支持亮色/暗色主题切换
- 📱 可拖拽的悬浮按钮
- 🔄 双打包机制：Vite 开发预览 + tsdown 库打包（仅 ESM 格式，输出 .mjs）

#### 📋 日志面板
- ✅ 捕获所有 console 方法（log、info、warn、error、debug）
- ✅ 支持多参数和复杂对象的格式化显示
- ✅ 时间戳和日志重复计数
- ✅ 命令行执行 JavaScript 代码
- ✅ 自动滚动和清空功能

#### 🌐 网络面板
- ✅ 拦截 XMLHttpRequest 和 Fetch 请求
- ✅ 显示请求方法、URL、状态码、耗时
- ✅ 查看请求头、响应头
- ✅ 查看请求数据和响应数据
- ✅ 网络请求详情弹窗

#### 🔍 元素面板
- ✅ DOM 树结构查看
- ✅ 递归展开/折叠节点
- ✅ 元素详情显示（标签、ID、类名、属性、文本）
- ✅ 刷新、全部展开/收起功能

#### 💾 存储面板
- ✅ Cookies 查看和删除
- ✅ LocalStorage 查看、删除、清空
- ✅ SessionStorage 查看、删除、清空
- ✅ 标签页切换和刷新功能

#### 💻 系统面板
- ✅ 设备信息（屏幕分辨率、像素比、平台、语言等）
- ✅ 浏览器信息检测
- ✅ 存储统计（LocalStorage、SessionStorage、Cookies 数量）
- ✅ 性能信息（JS 堆内存使用情况）

### 技术特性
- 📦 使用最新版本的依赖（Vue 3.5.13、Vite 6.0.3、TypeScript 5.7.2）
- 🎯 完整的 TypeScript 类型定义
- 🚀 ESM 模块格式打包
- 📝 全中文界面和文档
- 🎨 CSS 变量支持自定义主题
- 📱 移动端优化的触摸交互

### 开发工具
- ✨ 完整的演示页面和测试用例
- 📖 详细的中文 README 文档
- 🔧 TypeScript 类型声明文件
- 🎯 规范的项目结构

### 参考
- 本项目参考 [vConsole](https://github.com/Tencent/vConsole) 的设计和功能
- 使用现代化的 Vue 3.5 和 TypeScript 技术栈重新实现
