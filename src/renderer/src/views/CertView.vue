<template>
  <div class="cert">
    <h1>证书管理</h1>
    <div class="action">
      <el-button type="primary" @click="createCert">创建证书</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const createCert = async (): Promise<void> => {
  try {
    await window.electron.ipcRenderer.invoke('create-cert')
    console.log('证书创建请求已发送')
  } catch (error) {
    console.error('创建证书时出错:', error)
  }
}
</script>
