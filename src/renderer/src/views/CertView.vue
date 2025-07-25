<template>
  <div class="cert">
    <h1>创建证书</h1>
    <p style="color: firebrick">说明：这里创建的证书，仅保存在内存中，如需使用请及时导出文件。</p>

    <!-- 证书列表 -->
    <div class="action">
      <el-button type="primary" @click="showCreateDialog">创建证书</el-button>
    </div>

    <!-- 证书信息展示区域 -->
    <div v-if="certificate" class="cert-info-container">
      <h2>证书信息</h2>
      <el-table :data="[certificate]" border style="width: 100%">
        <el-table-column prop="id" label="证书ID" width="180" />
        <el-table-column label="主题信息">
          <template #default="{ row }">
            <p><strong>通用名称:</strong> {{ row.subject.commonName }}</p>
            <p><strong>国家:</strong> {{ row.subject.country }}</p>
            <p><strong>省/州:</strong> {{ row.subject.state }}</p>
            <p><strong>地区:</strong> {{ row.subject.locality }}</p>
            <p><strong>组织:</strong> {{ row.subject.organization }}</p>
            <p><strong>组织单位:</strong> {{ row.subject.organizationUnit }}</p>
          </template>
        </el-table-column>
        <el-table-column label="证书详情">
          <template #default="{ row }">
            <p><strong>颁发者:</strong> {{ row.certInfo.issuer }}</p>
            <p><strong>指纹:</strong> {{ row.certInfo.thumbprint }}</p>
            <p><strong>有效期从:</strong> {{ formatDate(row.certInfo.notBefore) }}</p>
            <p><strong>有效期至:</strong> {{ formatDate(row.certInfo.notAfter) }}</p>
            <p><strong>序列号:</strong> {{ row.certInfo.serialNumber }}</p>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showCertDetails(row)"
              >查看详情</el-button
            >
            <br />
            <el-dropdown
              split-button
              type="success"
              size="small"
              @click="trustCertificate(row, 'CurrentUser')"
            >
              一键信任（用户）
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="trustCertificate(row, 'LocalMachine')"
                    >一键信任（计算机）</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 使用抽取的证书详情抽屉组件 -->
    <certificate-detail-drawer
      v-model:visible="drawerVisible"
      :certificate="selectedCert"
      :private-password="privatePassword"
      :friendly-name="friendlyName"
    />

    <!-- 创建证书对话框 -->
    <el-dialog v-model="createDialogVisible" top="3vh" title="创建证书" width="60%">
      <el-form ref="certFormRef" :model="certForm" label-width="120px" :rules="rules">
        <el-form-item label="通用名称" prop="commonName">
          <el-input v-model="certForm.commonName" placeholder="请输入域名或IP地址" />
        </el-form-item>

        <el-form-item label="备用名称">
          <el-tag
            v-for="(altName, index) in certForm.altNames"
            :key="index"
            closable
            @close="removeAltName(index)"
          >
            {{ altName }}
          </el-tag>
          <el-input
            v-if="inputAltNameVisible"
            ref="inputAltNameRef"
            v-model="inputAltName"
            class="input-new-tag"
            size="small"
            @keyup.enter="addAltName"
            @blur="addAltName"
          />
          <el-button v-else size="small" @click="showInputAltName">+ 添加备用名称</el-button>
        </el-form-item>

        <el-form-item label="国家" prop="country">
          <el-input v-model="certForm.country" placeholder="两位国家代码，如CN" />
        </el-form-item>

        <el-form-item label="省/州" prop="state">
          <el-input v-model="certForm.state" placeholder="省份或州名" />
        </el-form-item>

        <el-form-item label="城市" prop="locality">
          <el-input v-model="certForm.locality" placeholder="城市名" />
        </el-form-item>

        <el-form-item label="组织" prop="organization">
          <el-input v-model="certForm.organization" placeholder="组织名称" />
        </el-form-item>

        <el-form-item label="组织单位" prop="organizationUnit">
          <el-input v-model="certForm.organizationUnit" placeholder="部门名称" />
        </el-form-item>

        <el-form-item label="有效期(天)" prop="validityDays">
          <el-input-number v-model="certForm.validityDays" :min="1" :max="3650" />
        </el-form-item>

        <el-form-item label="密钥大小" prop="keySize">
          <el-select v-model="certForm.keySize">
            <el-option label="2048位" :value="2048" />
            <el-option label="4096位" :value="4096" />
          </el-select>
        </el-form-item>

        <fieldset>
          <legend>生成P12文件需要</legend>
          <el-form-item label="私钥密码" prop="country">
            <el-input v-model="privatePassword" placeholder="私钥密码" />
          </el-form-item>
          <el-form-item label="友好的名称" prop="country">
            <el-input v-model="friendlyName" placeholder="friendlyName " />
          </el-form-item>
        </fieldset>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="creating" @click="createCert"> 创建 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { createCertificate } from '@renderer/api/certificate'
import { CreateCertResult, CertificateCreateData } from '@dto/certificate'
import { deepToRaw } from '@renderer/utils/index'
import CertificateDetailDrawer from '@renderer/components/CertificateDetailDrawer.vue'
import { importCertificateTrust, checkCertificateTrust } from '@renderer/api/certificate'
import { deleteFile, saveFile } from '@renderer/api'

// 一键信任证书
const trusting = ref(false)
const trustCertificate = async (
  cert: CreateCertResult,
  storeLocation: 'CurrentUser' | 'LocalMachine' = 'CurrentUser'
) => {
  trusting.value = true
  try {
    // 首先检查证书是否已信任
    const trustedCerts = await checkCertificateTrust({
      thumbprint: cert.certInfo.thumbprint
    })

    if (trustedCerts && trustedCerts.length > 0) {
      ElMessage.warning('该证书已在信任存储中')
      return
    }

    // 创建临时文件
    const tempPath = await window.electron.ipcRenderer.invoke('getPath', 'temp')
    const certFilePath = `${tempPath}/${cert.id}.crt`
    await saveFile(certFilePath, cert.pem.certificate)

    // 导入证书到信任存储
    await importCertificateTrust(certFilePath, storeLocation, 'Root')

    // 删除临时文件
    await deleteFile(certFilePath)

    ElMessage.success('证书已成功添加到信任存储')
  } catch (error) {
    console.error('信任证书时出错:', error)
    ElMessage.error('信任证书失败: ' + (error as Error).message)
  } finally {
    trusting.value = false
  }
}
// 证书列表
const certificate = ref<CreateCertResult>()

// 抽屉控制
const drawerVisible = ref(false)
const selectedCert = ref<CreateCertResult | null>(null)

// 显示证书详情
const showCertDetails = (cert: CreateCertResult) => {
  selectedCert.value = cert
  drawerVisible.value = true
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

// 创建证书表单
const certFormRef = ref<FormInstance>()
const createDialogVisible = ref(false)
const creating = ref(false)
const defaultCertForm = {
  commonName: 'localhost',
  country: 'CN',
  state: 'Beijing',
  locality: 'Beijing',
  organization: 'Cert-Tool',
  organizationUnit: 'Cert-Tool',
  altNames: ['localhost'],
  validityDays: 365,
  keySize: 2048
}
const certForm = ref<CertificateCreateData>(defaultCertForm)

// 表单验证规则
const rules = {
  commonName: [{ required: true, message: '请输入通用名称', trigger: 'blur' }],
  country: [
    { required: true, message: '请输入国家代码', trigger: 'blur' },
    { min: 2, max: 2, message: '国家代码必须是两个字符', trigger: 'blur' }
  ]
}

// 备用名称输入
const inputAltNameVisible = ref(false)
const inputAltName = ref('')
const inputAltNameRef = ref()
const privatePassword = ref('password')
const friendlyName = ref('friendlyName')

function setDefaultForm() {
  friendlyName.value = 'friendlyName'
  privatePassword.value = 'password'
  certForm.value = defaultCertForm
}
// 显示创建证书对话框
const showCreateDialog = () => {
  createDialogVisible.value = true
}

// 删除saveCertificates函数，改为使用抽屉组件中的导出功能

// 创建证书
const createCert = async () => {
  if (!certFormRef.value) return

  await certFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        creating.value = true
        const form = deepToRaw(certForm.value)
        console.log(form)

        const result = await createCertificate(form)

        if (result) {
          ElMessage.success('证书创建成功')
          certificate.value = result
          createDialogVisible.value = false
          console.log(result)

          // 自动显示证书详情抽屉，方便用户导出
          selectedCert.value = result
          drawerVisible.value = true

          // 重置表单
          setDefaultForm()
        } else {
          ElMessage.error('证书创建失败')
        }
      } catch (error) {
        console.error('创建证书时出错:', error)
        ElMessage.error('创建证书失败')
      } finally {
        creating.value = false
      }
    }
  })
}

// 添加备用名称
const showInputAltName = () => {
  inputAltNameVisible.value = true
  nextTick(() => {
    inputAltNameRef.value.focus()
  })
}

const addAltName = () => {
  const altName = inputAltName.value.trim()
  if (altName) {
    if (!certForm.value.altNames) {
      certForm.value.altNames = []
    }
    certForm.value.altNames.push(altName)
  }
  inputAltNameVisible.value = false
  inputAltName.value = ''
}

const removeAltName = (index: number) => {
  if (certForm.value.altNames) {
    certForm.value.altNames.splice(index, 1)
  }
}
</script>

<style scoped>
/* 紧凑创建证书页面 */
.cert {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.cert h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.cert h1::before {
  content: '';
  width: 3px;
  height: 1.5rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 2px;
}

.cert > p {
  color: #ef4444;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 0.375rem;
  border-left: 3px solid #ef4444;
  font-size: 0.875rem;
}

.action {
  margin: 1rem 0;
}

.action .el-button {
  border-radius: 0.375rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.cert-info-container {
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.cert-info-container h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.cert-info-container h2::before {
  content: '';
  width: 3px;
  height: 1.25rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 2px;
}

.cert-info-container .el-table {
  border-radius: 0.375rem;
  overflow: hidden;
}

.cert-info-container .el-table td {
  padding: 0.75rem;
}

.cert-info-container .el-table p {
  margin: 0.125rem 0;
  font-size: 0.75rem;
}

.cert-info-container .el-table strong {
  color: #1e293b;
}

.cert-info-container .el-button {
  margin: 0.125rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

/* 紧凑创建证书对话框 */
:deep(.el-dialog) {
  border-radius: 0.5rem;
}

:deep(.el-dialog__header) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-dialog__title) {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

:deep(.el-dialog__body) {
  padding: 1rem 1.25rem;
}

:deep(.el-form-item) {
  margin-bottom: 1rem;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

:deep(.el-input__wrapper) {
  border-radius: 0.375rem;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 0.375rem;
}

:deep(.el-input-number) {
  border-radius: 0.375rem;
}

:deep(fieldset) {
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin: 0.75rem 0;
}

:deep(legend) {
  padding: 0 0.375rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

/* 紧凑标签输入 */
.input-new-tag {
  width: 160px;
  margin-right: 0.5rem;
  vertical-align: bottom;
  border-radius: 0.375rem;
}

:deep(.el-tag) {
  margin: 0.125rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

/* 紧凑空状态 */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cert {
    padding: 0.75rem;
  }

  .cert-info-container {
    padding: 0.75rem;
  }

  .cert-info-container .el-table {
    font-size: 0.75rem;
  }
}
</style>
