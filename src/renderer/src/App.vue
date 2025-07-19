<script setup lang="ts">
// 不需要额外的脚本逻辑
</script>

<template>
  <div class="app-container">
    <el-menu mode="horizontal" router>
      <el-menu-item index="/">证书管理</el-menu-item>
      <el-menu-item index="/cert">创建证书</el-menu-item>
      <el-menu-item index="/about">关于</el-menu-item>
    </el-menu>

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
