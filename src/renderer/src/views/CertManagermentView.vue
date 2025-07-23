<template>
  <div class="cert-management">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon size="24" color="#2563eb">
              <Document />
            </el-icon>
            证书管理中心
          </h1>
          <p class="page-subtitle">管理和查看系统中的受信任根证书</p>
        </div>

        <div class="header-actions">
          <el-select
            v-model="location"
            style="width: 140px"
            @change="fetchCertificates"
            class="location-select"
          >
            <el-option label="本地计算机" value="LocalMachine" />
            <el-option label="当前用户" value="CurrentUser" />
          </el-select>

          <el-button
            type="primary"
            :loading="loading"
            @click="fetchCertificates"
            class="refresh-btn"
          >
            <el-icon><Refresh /></el-icon>
            刷新列表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#2563eb">
                  <Document />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ certificates.length }}</div>
                <div class="stat-label">总证书数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#10b981">
                  <Check />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ validCertificates.length }}</div>
                <div class="stat-label">有效证书</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#f59e0b">
                  <Warning />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ expiringCertificates.length }}</div>
                <div class="stat-label">即将过期</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#ef4444">
                  <CircleClose />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ expiredCertificates.length }}</div>
                <div class="stat-label">已过期</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主内容卡片 -->
    <el-card class="certificate-card">
      <template #header>
        <div class="card-header">
          <div class="card-title">
            <el-icon><Document /></el-icon>
            <span>受信任的根证书列表</span>
          </div>
          <div class="card-subtitle">
            共 {{ filteredCertificates.length }} 个证书
          </div>
        </div>
      </template>

      <!-- 搜索和筛选区域 -->
      <div class="filter-section">
        <el-row :gutter="16" align="middle">
          <el-col :span="8">
            <el-input
              v-model="filterText"
              placeholder="搜索证书名称、组织或指纹..."
              clearable
              prefix-icon="Search"
              class="search-input"
            />
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="statusFilter"
              placeholder="证书状态"
              clearable
              class="status-select"
            >
              <el-option label="全部" value="" />
              <el-option label="有效" value="valid" />
              <el-option label="即将过期" value="expiring" />
              <el-option label="已过期" value="expired" />
            </el-select>
          </el-col>
          <el-col :span="12" style="text-align: right">
            <el-button
              v-if="filterText || statusFilter"
              type="info"
              text
              @click="clearFilters"
            >
              清除筛选
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 证书表格 -->
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="pagedCertificates"
          style="width: 100%"
          stripe
          class="certificate-table"
          :header-cell-style="{ background: '#f8fafc', color: '#1e293b', fontWeight: 600 }"
        >
          <el-table-column type="expand">
            <template #default="scope">
              <div class="certificate-details">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="指纹">
                    <el-tag size="small" type="info">{{ scope.row.thumbprint }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="序列号">
                    {{ scope.row.serialNumber }}
                  </el-descriptions-item>
                  <el-descriptions-item label="颁发者">
                    {{ scope.row.parsedIssuer?.commonName || 'N/A' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="有效期">
                    <el-tag
                      :type="getCertificateStatus(scope.row).type"
                      size="small"
                    >
                      {{ getCertificateStatus(scope.row).text }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="证书信息" min-width="300">
            <template #default="scope">
              <div class="cert-info">
                <div class="cert-name">
                  <el-icon size="16" color="#2563eb">
                    <Document />
                  </el-icon>
                  <span>{{ scope.row.parsedSubject?.commonName || '未知证书' }}</span>
                </div>
                <div class="cert-org">{{ scope.row.parsedSubject?.organization || 'N/A' }}</div>
                <div class="cert-unit">{{ scope.row.parsedSubject?.organizationUnit || 'N/A' }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag
                :type="getCertificateStatus(scope.row).type"
                :class="getCertificateStatus(scope.row).class"
              >
                {{ getCertificateStatus(scope.row).text }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="有效期" width="200">
            <template #default="scope">
              <div class="validity-info">
                <div class="validity-item">
                  <span class="label">开始:</span>
                  <span class="value">{{ formatDate(scope.row.notBefore) }}</span>
                </div>
                <div class="validity-item">
                  <span class="label">结束:</span>
                  <span class="value">{{ formatDate(scope.row.notAfter) }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="颁发者" min-width="200">
            <template #default="scope">
              <div class="issuer-info">
                <div>{{ scope.row.parsedIssuer?.commonName || 'N/A' }}</div>
                <div class="issuer-org">{{ scope.row.parsedIssuer?.organization || '' }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="deleteCertificate(scope.row)"
                class="delete-btn"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="!loading && pagedCertificates.length === 0" class="empty-container">
          <el-empty
            description="暂无证书数据"
            image="/empty-certificate.svg"
          >
            <template #description>
              <div class="empty-content">
                <p>没有找到证书数据</p>
                <p class="empty-subtitle">请尝试刷新列表或切换证书存储位置</p>
              </div>
            </template>
          </el-empty>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="certificates.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredCertificates.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { getTrustedRootCertificates, removeCertificateTrust } from '@renderer/api/certificate'
import { CertificateInfo } from '@dto/certificate'

import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, StarFilled, Document, Check, Warning, CircleClose, Delete, Search } from '@element-plus/icons-vue'

// 证书列表数据
const certificates = ref<CertificateInfo[]>([])
// 筛选文本
const filterText = ref('')
// 状态筛选
const statusFilter = ref('')
// 加载状态
const loading = ref(false)
// 证书存储位置
const location = ref<'LocalMachine' | 'CurrentUser'>('LocalMachine')
// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)

// 计算证书状态
const getCertificateStatus = (cert: CertificateInfo) => {
  const now = new Date()
  const notBefore = new Date(cert.notBefore)
  const notAfter = new Date(cert.notAfter)
  const daysUntilExpiry = Math.ceil((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (notAfter < now) {
    return { type: 'danger', text: '已过期', class: 'status-expired' }
  } else if (daysUntilExpiry <= 30) {
    return { type: 'warning', text: '即将过期', class: 'status-expiring' }
  } else {
    return { type: 'success', text: '有效', class: 'status-valid' }
  }
}

// 计算各类证书数量
const validCertificates = computed(() => {
  return certificates.value.filter(cert => getCertificateStatus(cert).text === '有效')
})

const expiringCertificates = computed(() => {
  return certificates.value.filter(cert => getCertificateStatus(cert).text === '即将过期')
})

const expiredCertificates = computed(() => {
  return certificates.value.filter(cert => getCertificateStatus(cert).text === '已过期')
})

// 筛选后的证书列表
const filteredCertificates = computed(() => {
  let filtered = certificates.value

  // 文本搜索
  if (filterText.value) {
    const searchText = filterText.value.toLowerCase()
    filtered = filtered.filter((cert) => {
      return (
        cert.parsedSubject?.commonName?.toLowerCase().includes(searchText) ||
        cert.parsedSubject?.organization?.toLowerCase().includes(searchText) ||
        cert.thumbprint?.toLowerCase().includes(searchText)
      )
    })
  }

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(cert => {
      const status = getCertificateStatus(cert).text
      switch (statusFilter.value) {
        case 'valid': return status === '有效'
        case 'expiring': return status === '即将过期'
        case 'expired': return status === '已过期'
        default: return true
      }
    })
  }

  return filtered
})

// 分页后的证书列表
const pagedCertificates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCertificates.value.slice(start, end)
})

// 清除筛选
const clearFilters = () => {
  filterText.value = ''
  statusFilter.value = ''
}

// 获取证书列表
const fetchCertificates = async () => {
  loading.value = true
  try {
    const res = await getTrustedRootCertificates(location.value)
    certificates.value = res
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
    return date.toLocaleDateString('zh-CN')
  } catch {
    return dateString
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 删除证书
const deleteCertificate = async (cert: CertificateInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除证书 "${cert.parsedSubject?.commonName || '未知证书'}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await removeCertificateTrust(cert.thumbprint, location.value, 'Root', true)
    ElMessage.success('证书删除成功')
    fetchCertificates()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除证书时出错:', error)
      ElMessage.error('证书删除失败: ' + error.message)
    }
  }
}

// 页面加载时获取证书列表
onMounted(() => {
  fetchCertificates()
})
</script>

<style scoped>
.cert-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow: hidden;
}

/* 页面标题区域 */
.page-header {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.location-select {
  border-radius: 0.5rem;
}

.refresh-btn {
  border-radius: 0.5rem;
}

/* 统计卡片区域 */
.stats-section {
  margin-bottom: 0.5rem;
}

.stat-card {
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: rgba(37, 99, 235, 0.1);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* 主内容卡片 */
.certificate-card {
  flex-grow: 1;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #64748b;
}

/* 筛选区域 */
.filter-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.search-input {
  border-radius: 0.5rem;
}

.status-select {
  border-radius: 0.5rem;
}

/* 表格样式 */
.table-container {
  padding: 1rem 1.5rem;
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.certificate-table {
  border-radius: 0.5rem;
  overflow: hidden;
}

/* 确保表格可以滚动 */
:deep(.el-table__body-wrapper) {
  overflow: auto;
  max-height: calc(100vh - 400px);
}

:deep(.el-table) {
  height: 100%;
}

/* 自定义滚动条样式 */
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.cert-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cert-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e293b;
}

.cert-org {
  font-size: 0.875rem;
  color: #64748b;
}

.cert-unit {
  font-size: 0.75rem;
  color: #94a3b8;
}

.validity-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.validity-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.validity-item .label {
  color: #64748b;
  min-width: 2.5rem;
}

.validity-item .value {
  color: #1e293b;
}

.issuer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.issuer-org {
  font-size: 0.875rem;
  color: #64748b;
}

.certificate-details {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.delete-btn {
  border-radius: 0.375rem;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.empty-content {
  text-align: center;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.pagination-container {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.pagination {
  border-radius: 0.5rem;
}

/* 状态标签样式 */
.status-valid {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.status-expiring {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.status-expired {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .stats-section .el-col {
    margin-bottom: 1rem;
  }
}
</style>
