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
            <p><strong>版本：</strong> 1.0.0</p>
            <p><strong>开发者：</strong> gaoyia@live.com</p>
            <p>
              <strong>链接：</strong>
              <br />
              <a style="word-break: break-all" href="https://github.com/gaoyia/CertTool">
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
.donate-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 2.5rem;
  color: #409eff;
  margin-bottom: 10px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 1.2rem;
  color: #606266;
  margin-bottom: 20px;
}

.donate-card,
.settings-card,
.info-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.donate-card:hover,
.settings-card:hover,
.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.donate-qrcode {
  width: 250px;
  height: 250px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.donate-qrcode:hover {
  transform: scale(1.02);
}

.donate-message {
  margin-top: 15px;
  font-size: 16px;
  color: #606266;
  text-align: center;
}

.story-section {
  padding: 10px;
  color: #606266;
  line-height: 1.6;
}

.image-gallery {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  flex-direction: column;
}

.gallery-image {
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.gallery-image:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.setting-form {
  padding: 10px;
}

.setting-label {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.homepage-select {
  width: 100%;
  margin-bottom: 15px;
}

.setting-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
  line-height: 1.4;
}

.project-info {
  padding: 10px;
  color: #606266;
  line-height: 1.6;
}

.info-description {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-left: 4px solid #409eff;
  border-radius: 4px;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .el-row {
    display: flex;
    flex-direction: column;
  }

  .el-col {
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
