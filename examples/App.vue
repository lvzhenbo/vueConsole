<template>
  <div class="container">
    <h1>🎯 VueConsole 演示</h1>

    <div class="card">
      <h2>📋 功能介绍</h2>
      <div class="description">
        VueConsole 是一个基于 Vue 3.5 + TypeScript 开发的移动端调试工具，类似于 vConsole。
        点击右下角的"调试"按钮即可打开调试面板。
      </div>
      <ul class="feature-list">
        <li>日志面板 - 查看和执行JavaScript命令</li>
        <li>系统面板 - 查看设备和浏览器信息</li>
        <li>网络面板 - 监控网络请求</li>
        <li>元素面板 - 查看DOM结构</li>
        <li>存储面板 - 管理Cookies/LocalStorage/SessionStorage</li>
      </ul>
    </div>

    <div class="card">
      <h2>🧪 日志测试</h2>
      <div class="button-group">
        <button @click="testLog">普通日志</button>
        <button @click="testInfo">信息日志</button>
        <button @click="testWarn">警告日志</button>
        <button @click="testError">错误日志</button>
        <button @click="testMultiple">多参数日志</button>
        <button @click="testObject">对象日志</button>
      </div>
    </div>

    <div class="card">
      <h2>🌐 网络测试</h2>
      <div class="button-group">
        <button @click="testFetch">Fetch请求</button>
        <button @click="testXHR">XHR请求</button>
        <button @click="testPostRequest">POST请求</button>
        <button @click="testFailRequest">失败请求</button>
      </div>
    </div>

    <div class="card">
      <h2>💾 存储测试</h2>
      <input v-model="storageKey" placeholder="输入键名" />
      <input v-model="storageValue" placeholder="输入值" />
      <div class="button-group">
        <button @click="setLocalStorage">设置LocalStorage</button>
        <button @click="setSessionStorage">设置SessionStorage</button>
        <button @click="setCookie">设置Cookie</button>
        <button @click="clearStorage">清空存储</button>
      </div>
    </div>

    <div class="card">
      <h2>🎨 DOM测试</h2>
      <div class="button-group">
        <button @click="addElement">添加元素</button>
        <button @click="removeElement">删除元素</button>
      </div>
      <div id="test-container" style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
        <p>这是一个测试容器</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const storageKey = ref('testKey')
const storageValue = ref('testValue')

// 日志测试
function testLog() {
  console.log('这是一条普通日志消息')
}

function testInfo() {
  console.info('这是一条信息日志消息')
}

function testWarn() {
  console.warn('这是一条警告日志消息')
}

function testError() {
  console.error('这是一条错误日志消息')
}

function testMultiple() {
  console.log('多参数日志:', 123, true, { name: '测试' }, [1, 2, 3])
}

function testObject() {
  const obj = {
    name: '张三',
    age: 25,
    address: {
      city: '北京',
      district: '朝阳区'
    },
    hobbies: ['编程', '音乐', '运动']
  }
  console.log('复杂对象:', obj)
}

// 网络测试
async function testFetch() {
  try {
    const response = await fetch('https://api.github.com/users/github')
    const data = await response.json()
    console.log('Fetch请求成功:', data)
  } catch (error) {
    console.error('Fetch请求失败:', error)
  }
}

function testXHR() {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', 'https://api.github.com/users/github')
  xhr.onload = function() {
    console.log('XHR请求成功')
  }
  xhr.onerror = function() {
    console.error('XHR请求失败')
  }
  xhr.send()
}

async function testPostRequest() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: '测试标题',
        body: '测试内容',
        userId: 1
      })
    })
    const data = await response.json()
    console.log('POST请求成功:', data)
  } catch (error) {
    console.error('POST请求失败:', error)
  }
}

async function testFailRequest() {
  try {
    await fetch('https://invalid-domain-that-does-not-exist-12345.com/api')
  } catch (error) {
    console.error('请求失败（这是预期的）:', error)
  }
}

// 存储测试
function setLocalStorage() {
  localStorage.setItem(storageKey.value, storageValue.value)
  console.log(`已设置 LocalStorage: ${storageKey.value} = ${storageValue.value}`)
}

function setSessionStorage() {
  sessionStorage.setItem(storageKey.value, storageValue.value)
  console.log(`已设置 SessionStorage: ${storageKey.value} = ${storageValue.value}`)
}

function setCookie() {
  document.cookie = `${storageKey.value}=${storageValue.value}; path=/`
  console.log(`已设置 Cookie: ${storageKey.value} = ${storageValue.value}`)
}

function clearStorage() {
  localStorage.clear()
  sessionStorage.clear()
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim()
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  })
  console.log('已清空所有存储')
}

// DOM测试
let elementCount = 0
function addElement() {
  const container = document.getElementById('test-container')
  if (container) {
    const div = document.createElement('div')
    div.className = 'test-element'
    div.textContent = `动态元素 #${++elementCount}`
    div.style.cssText = 'padding: 8px; margin: 8px 0; background: white; border-radius: 4px;'
    container.appendChild(div)
    console.log('已添加元素:', div)
  }
}

function removeElement() {
  const container = document.getElementById('test-container')
  const elements = container?.getElementsByClassName('test-element')
  if (elements && elements.length > 0) {
    const lastElement = elements[elements.length - 1]
    lastElement.remove()
    console.log('已删除元素')
  } else {
    console.warn('没有可删除的元素')
  }
}
</script>
