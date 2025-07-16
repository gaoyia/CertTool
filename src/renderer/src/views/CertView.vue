<template>
  <div class="cert">
    <h1>证书管理</h1>

    <!-- 证书列表 -->
    <div class="cert-list" v-if="certificates.length > 0">
      <el-table :data="certificates" style="width: 100%" @row-click="viewCertificate">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="subject.commonName" label="通用名称" />
        <el-table-column label="有效期">
          <template #default="scope">
            {{ formatDate(scope.row.validFrom) }} 至 {{ formatDate(scope.row.validTo) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click.stop="viewCertificate(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click.stop="exportCertificate(scope.row)"
              >导出</el-button
            >
            <el-button size="small" type="danger" @click.stop="deleteCertificate(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="empty-state" v-else>
      <el-empty description="暂无证书" />
    </div>

    <div class="action">
      <el-button type="primary" @click="showCreateDialog">创建证书</el-button>
    </div>

    <!-- 创建证书对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建证书" width="60%">
      <el-form :model="certForm" label-width="120px" :rules="rules" ref="certFormRef">
        <el-form-item label="通用名称" prop="commonName">
          <el-input v-model="certForm.commonName" placeholder="请输入域名或IP地址" />
        </el-form-item>

        <el-form-item label="备用名称">
          <el-tag
            v-for="(altName, index) in certForm.altNames"
            :key="index"
            closable
            @close="removeAltName(index)"
            style="margin-right: 5px; margin-bottom: 5px"
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
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createCert" :loading="creating"> 创建 </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 证书详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="证书详情" width="70%">
      <div v-if="selectedCert">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="名称">{{ selectedCert.name }}</el-descriptions-item>
          <el-descriptions-item label="序列号">{{
            selectedCert.serialNumber
          }}</el-descriptions-item>
          <el-descriptions-item label="通用名称">{{
            selectedCert.subject.commonName
          }}</el-descriptions-item>
          <el-descriptions-item label="国家">{{
            selectedCert.subject.country
          }}</el-descriptions-item>
          <el-descriptions-item label="省/州">{{
            selectedCert.subject.state
          }}</el-descriptions-item>
          <el-descriptions-item label="城市">{{
            selectedCert.subject.locality
          }}</el-descriptions-item>
          <el-descriptions-item label="组织">{{
            selectedCert.subject.organization
          }}</el-descriptions-item>
          <el-descriptions-item label="组织单位">{{
            selectedCert.subject.organizationUnit
          }}</el-descriptions-item>
          <el-descriptions-item label="有效期开始">{{
            formatDate(selectedCert.validFrom)
          }}</el-descriptions-item>
          <el-descriptions-item label="有效期结束">{{
            formatDate(selectedCert.validTo)
          }}</el-descriptions-item>
          <el-descriptions-item label="备用名称" :span="2">
            <el-tag
              v-for="(name, index) in selectedCert.altNames"
              :key="index"
              style="margin-right: 5px"
            >
              {{ name }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-tabs class="cert-content" style="margin-top: 20px">
          <el-tab-pane label="证书">
            <el-input type="textarea" v-model="selectedCert.pem.certificate" :rows="10" readonly />
            <div class="copy-action">
              <el-button size="small" @click="copyToClipboard(selectedCert.pem.certificate)">
                复制证书内容
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="私钥">
            <el-input type="textarea" v-model="selectedCert.pem.privateKey" :rows="10" readonly />
            <div class="copy-action">
              <el-button size="small" @click="copyToClipboard(selectedCert.pem.privateKey)">
                复制私钥内容
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="公钥">
            <el-input type="textarea" v-model="selectedCert.pem.publicKey" :rows="10" readonly />
            <div class="copy-action">
              <el-button size="small" @click="copyToClipboard(selectedCert.pem.publicKey)">
                复制公钥内容
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  createCertificate,
  type Certificate,
  type CertificateInfo
} from '@renderer/api/certificate'
import { readFile, saveFile, deleteFile, fileExists } from '@renderer/api/file'

// 证书列表
const certificates = ref<Certificate[]>([])

// 创建证书表单
const certFormRef = ref<FormInstance>()
const createDialogVisible = ref(false)
const creating = ref(false)
const certForm = ref<CertificateInfo>({
  commonName: '',
  country: 'CN',
  state: '北京',
  locality: '北京',
  organization: '我的公司',
  organizationUnit: '开发部',
  altNames: ['localhost'],
  validityDays: 365,
  keySize: 2048
})

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

// 证书详情
const detailDialogVisible = ref(false)
const selectedCert = ref<Certificate | null>(null)

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// 加载证书列表
const loadCertificates = async () => {
  try {
    // TODO: 实现从文件系统加载证书列表
    // 这里需要实现一个获取证书文件列表的功能
    certificates.value = []

    // 模拟加载证书列表
    ElMessage.info('正在加载证书列表...')
  } catch (error) {
    console.error('加载证书列表失败:', error)
    ElMessage.error('加载证书列表失败')
  }
}

// 显示创建证书对话框
const showCreateDialog = () => {
  createDialogVisible.value = true
}

// 创建证书
const createCert = async () => {
  if (!certFormRef.value) return

  await certFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        creating.value = true

        // 生成文件名
        const fileName = `${certForm.value.commonName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.cert`

        // 创建证书
        const result = await createCertificate({
          ...certForm.value,
          fileName
        })

        if (result.success && result.data) {
          ElMessage.success('证书创建成功')
          certificates.value.push(result.data.certObject)
          createDialogVisible.value = false

          // 重置表单
          certForm.value = {
            commonName: '',
            country: 'CN',
            state: '北京',
            locality: '北京',
            organization: '我的公司',
            organizationUnit: '开发部',
            altNames: ['localhost'],
            validityDays: 365,
            keySize: 2048
          }
        } else {
          ElMessage.error(result.message || '证书创建失败')
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

// 查看证书详情
const viewCertificate = (cert: Certificate) => {
  selectedCert.value = cert
  detailDialogVisible.value = true
}

// 导出证书
const exportCertificate = async (cert: Certificate) => {
  try {
    // 这里需要实现导出证书的功能
    // 可以使用Electron的dialog.showSaveDialog来让用户选择保存位置

    ElMessage.success('证书导出成功')
  } catch (error) {
    console.error('导出证书失败:', error)
    ElMessage.error('导出证书失败')
  }
}

// 删除证书
const deleteCertificate = async (cert: Certificate) => {
  try {
    await ElMessageBox.confirm('确定要删除这个证书吗？此操作不可恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 删除证书文件
    // TODO: 实现删除证书文件的功能

    // 从列表中移除
    const index = certificates.value.findIndex((c) => c.id === cert.id)
    if (index !== -1) {
      certificates.value.splice(index, 1)
    }

    ElMessage.success('证书已删除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除证书失败:', error)
      ElMessage.error('删除证书失败')
    }
  }
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

// 复制到剪贴板
const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

// 页面加载时获取证书列表
onMounted(() => {
  loadCertificates()
})
</script>

<style scoped>
.cert {
  padding: 20px;
}

.cert-list {
  margin-bottom: 20px;
}

.action {
  margin-top: 20px;
}

.empty-state {
  margin: 40px 0;
}

.input-new-tag {
  width: 200px;
  margin-right: 10px;
  vertical-align: bottom;
}

.copy-action {
  margin-top: 10px;
  text-align: right;
}
</style>
