<script setup lang="ts">
import { Star } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 根据当前路由路径计算激活的菜单项
const activeMenu = computed(() => {
  // 如果是首页或证书管理页，激活"/"菜单
  if (route.path === '/' || route.path === '/cert-managerment') {
    return '/'
  }
  // 否则返回当前路径作为激活菜单的index
  return route.path
})
</script>

<template>
  <div class="app-container">
    <div class="donate-btn">
      <el-button :icon="Star" type="danger" round @click="$router.push('/donate')">
        赛博要饭
      </el-button>
    </div>
    <el-menu mode="horizontal" router :default-active="activeMenu">
      <el-menu-item index="/cert-managerment">证书管理</el-menu-item>
      <el-menu-item index="/cert">创建证书</el-menu-item>
      <el-menu-item index="/hosts">hosts编辑</el-menu-item>
    </el-menu>

    <div class="content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
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
