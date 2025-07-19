<template>
  <div class="home">
    <div class="header">
      <h1>证书管理工具</h1>
      <el-button type="primary" :loading="loading" @click="fetchCertificates">
        <el-icon><Refresh /></el-icon>
        刷新列表
      </el-button>
    </div>

    <el-card class="certificate-card">
      <template #header>
        <div class="card-header">
          <span>受信任的根证书列表</span>
          <el-select v-model="location" size="small" @change="fetchCertificates">
            <el-option label="本地计算机" value="LocalMachine" />
            <el-option label="当前用户" value="CurrentUser" />
          </el-select>
        </div>
      </template>

      <div class="filter-container">
        <el-input
          v-model="filterText"
          placeholder="输入关键词筛选(通用名称/组织/指纹)"
          clearable
          style="width: 300px; margin-right: 10px"
        />
        <span v-if="filterText" class="filter-count">
          找到 {{ filteredCertificates.length }} 个匹配项
        </span>
      </div>

      <el-table
        v-loading="loading"
        :data="filterText ? filteredCertificates : certificates"
        style="width: 100%"
        border
        stripe
        height="calc(100vh - 200px)"
      >
        <el-table-column label="主题" min-width="220">
          <template #default="scope">
            <div v-if="scope.row.parsedSubject">
              <p v-if="scope.row.parsedSubject.commonName">
                <strong>CN:</strong> {{ scope.row.parsedSubject.commonName }}
              </p>
              <p v-if="scope.row.parsedSubject.organization">
                <strong>O:</strong> {{ scope.row.parsedSubject.organization }}
              </p>
              <p v-if="scope.row.parsedSubject.organizationUnit">
                <strong>OU:</strong> {{ scope.row.parsedSubject.organizationUnit }}
              </p>
              <p v-if="scope.row.parsedSubject.country">
                <strong>C:</strong> {{ scope.row.parsedSubject.country }}
              </p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="颁发者" min-width="220">
          <template #default="scope">
            <div v-if="scope.row.parsedIssuer">
              <p v-if="scope.row.parsedIssuer.commonName">
                <strong>CN:</strong> {{ scope.row.parsedIssuer.commonName }}
              </p>
              <p v-if="scope.row.parsedIssuer.organization">
                <strong>O:</strong> {{ scope.row.parsedIssuer.organization }}
              </p>
              <p v-if="scope.row.parsedIssuer.organizationUnit">
                <strong>OU:</strong> {{ scope.row.parsedIssuer.organizationUnit }}
              </p>
              <p v-if="scope.row.parsedIssuer.country">
                <strong>C:</strong> {{ scope.row.parsedIssuer.country }}
              </p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="指纹与序列号" min-width="220">
          <template #default="scope">
            <div>
              <p><strong>指纹:</strong> {{ scope.row.thumbprint }}</p>
              <p><strong>序列号:</strong> {{ scope.row.serialNumber }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="有效期" min-width="180">
          <template #default="scope">
            <div>
              <p><strong>起始时间:</strong> {{ scope.row.notBefore }}</p>
              <p><strong>截止时间:</strong> {{ scope.row.notAfter }}</p>
            </div>
            {{ formatDate(scope.row.notBefore) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="120">
          <template #default="scope">
            <el-button type="danger" @click="deleteCertificate(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" v-if="certificates.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="filterText ? filteredCertificates.length : certificates.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <el-empty v-if="!loading && certificates?.length === 0" description="暂无证书数据" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { getTrustedRootCertificates, removeCertificateTrust } from '@renderer/api/certificate'
import { CertificateInfo } from '@dto/certificate'

import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { deepToRaw } from '@renderer/utils'

// 证书列表数据
const certificates = ref<CertificateInfo[]>([])
// 筛选文本
const filterText = ref('Cert-Tool')
// 加载状态
const loading = ref(false)
// 证书存储位置
const location = ref<'LocalMachine' | 'CurrentUser'>('LocalMachine')
// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)

// 筛选后的证书列表
const filteredCertificates = computed(() => {
  if (!filterText.value) {
    return certificates.value
  }
  const searchText = filterText.value.toLowerCase()
  return certificates.value.filter((cert) => {
    return (
      cert.parsedSubject?.commonName?.toLowerCase().includes(searchText) ||
      cert.parsedSubject?.organization?.toLowerCase().includes(searchText) ||
      cert.thumbprint?.toLowerCase().includes(searchText)
    )
  })
})

// 获取证书列表
const fetchCertificates = async () => {
  loading.value = true
  try {
    const res = await getTrustedRootCertificates(location.value)
    console.log(res)

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

// 删除证书
const deleteCertificate = async (cert: CertificateInfo) => {
  console.log(cert);
  try {
    await removeCertificateTrust(cert.thumbprint, location.value, 'Root', true)
    ElMessage.success('证书删除成功')
    // 重新获取证书列表
    fetchCertificates()
  } catch (error: any) {
    console.error('删除证书时出错:', error)
    ElMessage.error('证书删除失败: ' + error.message)
  }
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
