<template>
  <div class="donate-container">
    <div class="page-header">
      <h1 class="title">赛博要饭</h1>
      <div class="subtitle">感谢您对本项目的支持</div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：捐赠信息 -->
      <el-col :span="16">
        <el-card class="donate-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>支持开发者</span>
              <el-tag type="danger" effect="dark" size="small">感谢支持</el-tag>
            </div>
          </template>

          <div class="qrcode-container">
            <el-image :src="donate" class="donate-qrcode">
              <template #placeholder>
                <div class="image-placeholder">
                  <el-icon><Loading /></el-icon>
                </div>
              </template>
            </el-image>
            <p class="donate-message">如果觉得这个项目还不错，可以请我喝杯咖啡 ☕</p>
          </div>

          <el-divider content-position="center">开发者的碎碎念</el-divider>

          <div class="story-section">
            <p>买了A股股票亏了很多钱，工作也卷，现在只能要饭了。</p>
            <p>
              上市公司董事长挪用13亿投资其他产业，拒不还钱当老赖，资产也没要回来。A股一点保障都没有。
            </p>

            <div class="image-gallery">
              <el-image
                v-for="(img, index) in [img1, img2]"
                :key="index"
                :src="img"
                class="gallery-image"
              />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：设置和信息 -->
      <el-col :span="8">
        <!-- 首页设置卡片 -->
        <el-card class="settings-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>首页设置</span>
              <el-icon><Setting /></el-icon>
            </div>
          </template>

          <div class="setting-form">
            <p class="setting-label">选择默认首页：</p>
            <el-select
              v-model="selectedHomepage"
              placeholder="选择默认首页"
              class="homepage-select"
              @change="saveHomepageSetting"
            >
              <el-option label="证书管理" value="/cert-managerment" />
              <el-option label="创建证书" value="/cert" />
              <el-option label="hosts编辑" value="/hosts" />
            </el-select>
            <p class="setting-hint">选择后，下次打开应用将自动跳转到所选页面</p>
          </div>
        </el-card>

        <!-- 项目信息卡片 -->
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>项目信息</span>
              <el-icon><InfoFilled /></el-icon>
            </div>
          </template>

          <div class="project-info">
            <p><strong>项目名称：</strong> CertTool</p>
            <p><strong>版本：</strong>{{ pkg.version }}</p>
            <p><strong>开发者：</strong> gaoyia@live.com</p>
            <p>
              <strong>链接：</strong>
              <br />
              <a
                style="word-break: break-all"
                target="_blank"
                href="https://github.com/gaoyia/CertTool"
              >
                https://github.com/gaoyia/CertTool
              </a>
            </p>
            <p class="info-description">
              一个简单易用的证书管理工具，帮助您轻松创建和管理SSL证书。
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import img1 from '@renderer/assets/1.png'
import img2 from '@renderer/assets/2.png'
import donate from '@renderer/assets/donate.jpg'
import { ElMessage } from 'element-plus'
import { Setting, InfoFilled, Loading } from '@element-plus/icons-vue'
import pkg from '~/package.json'

// 首页设置相关
const selectedHomepage = ref('')

// 组件挂载时从localStorage获取当前设置
onMounted(() => {
  const savedHomepage = localStorage.getItem('index') || '/cert-managerment'
  selectedHomepage.value = savedHomepage
})

// 保存首页设置
const saveHomepageSetting = () => {
  localStorage.setItem('index', selectedHomepage.value)
  ElMessage({
    message: '首页设置已保存',
    type: 'success',
    duration: 2000
  })
}
</script>

<style scoped>
/* 紧凑捐赠页面 */
.donate-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.donate-card,
.settings-card,
.info-card {
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.donate-card:hover,
.settings-card:hover,
.info-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.donate-qrcode {
  width: 200px;
  height: 200px;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.donate-qrcode:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.donate-message {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #374151;
  text-align: center;
  font-weight: 500;
}

.story-section {
  padding: 1rem;
  color: #4b5563;
  line-height: 1.5;
}

.story-section p {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.image-gallery {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-direction: column;
}

.gallery-image {
  border-radius: 0.375rem;
  object-fit: cover;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  max-width: 100%;
  height: auto;
}

.gallery-image:hover {
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.setting-form {
  padding: 1rem;
}

.setting-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.75rem;
}

.homepage-select {
  width: 100%;
  margin-bottom: 0.5rem;
}

.setting-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  line-height: 1.4;
}

.project-info {
  padding: 1rem;
  color: #4b5563;
  line-height: 1.5;
}

.project-info p {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.project-info strong {
  color: #1e293b;
}

.project-info a {
  color: #2563eb;
  text-decoration: none;
  transition: color 0.2s ease;
}

.project-info a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.info-description {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-left: 3px solid #2563eb;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: #374151;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 0.375rem;
}

/* 紧凑动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.donate-card,
.settings-card,
.info-card {
  animation: fadeIn 0.3s ease-out;
}

/* 紧凑响应式调整 */
@media (max-width: 768px) {
  .donate-container {
    padding: 0.75rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .el-row {
    display: flex;
    flex-direction: column;
  }

  .el-col {
    width: 100% !important;
    max-width: 100% !important;
  }

  .donate-qrcode {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .donate-qrcode {
    width: 120px;
    height: 120px;
  }
}
</style>
