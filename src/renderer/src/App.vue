<script setup lang="ts">
import { Star } from '@element-plus/icons-vue'
</script>

<template>
  <div class="app-container">
    <div class="donate-btn">
      <el-button :icon="Star" type="danger" round @click="$router.push('/donate')">
        赛博要饭
      </el-button>
    </div>
    <el-menu mode="horizontal" router>
      <el-menu-item index="/">证书管理</el-menu-item>
      <el-menu-item index="/cert">创建证书</el-menu-item>
      <el-menu-item index="/hosts">hosts编辑</el-menu-item>
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

.donate-btn {
  position: fixed;
  top: 0;
  right: 0;
  margin: 10px;
  z-index: 1;
}
</style>
