<script setup lang="ts">
import { Star, Setting, Document, Plus, Edit } from '@element-plus/icons-vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// Element Plus 中文语言配置
const locale = zhCn

// 根据当前路由路径计算激活的菜单项
const activeMenu = computed(() => {
  if (route.path === '/' || route.path === '/cert-managerment') {
    return '/cert-managerment'
  }
  return route.path
})

// 导航菜单配置
const menuItems = [
  {
    index: '/cert-managerment',
    label: '证书管理',
    icon: Document
  },
  {
    index: '/cert',
    label: '创建证书',
    icon: Plus
  },
  {
    index: '/hosts',
    label: 'Hosts编辑',
    icon: Edit
  }
]
</script>

<template>
  <el-config-provider :locale="locale">
    <div class="app-container">
      <!-- 简洁顶部导航栏 -->
      <header class="app-header">
        <div class="nav-container">
          <div class="brand">
            <el-icon size="20" color="#2563eb">
              <Setting />
            </el-icon>
            <span>CertTool</span>
          </div>

          <nav class="nav-menu">
            <router-link
              v-for="item in menuItems"
              :key="item.index"
              :to="item.index"
              class="nav-item"
              :class="{ active: activeMenu === item.index }"
            >
              <el-icon size="16">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </router-link>
          </nav>

          <div class="nav-actions">
            <el-button
              :icon="Star"
              type="danger"
              text
              @click="$router.push('/donate')"
              class="support-btn"
            >
              支持
            </el-button>
          </div>
        </div>
      </header>

      <!-- 主内容区域 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </main>
    </div>
  </el-config-provider>
</template>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* 紧凑顶部导航栏 */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 48px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e2e8f0;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
  font-size: 1rem;
  color: #1e293b;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  transform: translateY(-1px);
}

.nav-item.active {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 1px;
  background: #2563eb;
  border-radius: 1px;
}

.nav-actions {
  display: flex;
  align-items: center;
}

.support-btn {
  font-weight: 600;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.support-btn:hover {
  transform: translateY(-1px);
}

.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: var(--bg-secondary);
}

/* 紧凑响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 0.75rem;
  }

  .nav-container {
    padding: 0 0.25rem;
  }

  .nav-menu {
    gap: 0.125rem;
  }

  .nav-item {
    padding: 0.375rem;
    font-size: 0.75rem;
  }

  .nav-item span {
    display: none;
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
