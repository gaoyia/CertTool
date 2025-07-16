<template>
  <div class="home">
    <div class="header">
      <h1>证书管理工具</h1>
      <el-button type="primary" @click="fetchCertificates" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新列表
      </el-button>
    </div>

    <el-card class="certificate-card">
      <template #header>
        <div class="card-header">
          <span>受信任的根证书列表</span>
          <el-select v-model="location" @change="fetchCertificates" size="small">
            <el-option label="本地计算机" value="LocalMachine" />
            <el-option label="当前用户" value="CurrentUser" />
          </el-select>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="certificates"
        style="width: 100%"
        border
        stripe
        height="calc(100vh - 200px)"
      >
        <el-table-column prop="subject" label="主题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="issuer" label="颁发者" min-width="200" show-overflow-tooltip />
        <el-table-column prop="thumbprint" label="指纹" min-width="150" show-overflow-tooltip />
        <el-table-column prop="serialNumber" label="序列号" min-width="150" show-overflow-tooltip />
        <el-table-column label="有效期起始时间" min-width="180">
          <template #default="scope">
            {{ formatDate(scope.row.notBefore) }}
          </template>
        </el-table-column>
        <el-table-column label="有效期截止时间" min-width="180">
          <template #default="scope">
            {{ formatDate(scope.row.notAfter) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" v-if="certificates.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="certificates.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <el-empty v-if="!loading && certificates?.length === 0" description="暂无证书数据" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getTrustedRootCertificates } from '@renderer/api/certificate'
import type { Certificate } from '@renderer/api/certificate'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

// 证书列表数据
const certificates = ref<Certificate[]>([])
// 加载状态
const loading = ref(false)
// 证书存储位置
const location = ref<'LocalMachine' | 'CurrentUser'>('LocalMachine')
// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)

// 获取证书列表
const fetchCertificates = async () => {
  loading.value = true
  try {
    const res = await getTrustedRootCertificates(location.value)
    console.log(res);

    certificates.value = res
    // 重置分页
    currentPage.value = 1
  } catch (error) {
    console.error('获取证书列表失败:', error)
    ElMessage.error('获取证书列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  } catch (error) {
    return dateString
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 页面加载时获取证书列表
onMounted(() => {
  fetchCertificates()
})
</script>

<style scoped>
.home {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.certificate-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
