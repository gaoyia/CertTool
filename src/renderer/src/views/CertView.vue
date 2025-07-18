<template>
  <div class="cert">
    <h1>创建证书</h1>

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
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showCertDetails(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 证书详情抽屉 -->
    <el-drawer v-model="drawerVisible" title="证书详细信息" size="50%">
      <el-tabs>
        <el-tab-pane label="证书">
          <div class="code-block">
            <pre>{{ selectedCert?.pem.certificate }}</pre>
            <el-button type="primary" size="small" @click="copyToClipboard(selectedCert?.pem.certificate)">
              复制
            </el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="私钥">
          <div class="code-block">
            <pre>{{ selectedCert?.pem.privateKey }}</pre>
            <el-button type="primary" size="small" @click="copyToClipboard(selectedCert?.pem.privateKey)">
              复制
            </el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="公钥">
          <div class="code-block">
            <pre>{{ selectedCert?.pem.publicKey }}</pre>
            <el-button type="primary" size="small" @click="copyToClipboard(selectedCert?.pem.publicKey)">
              复制
            </el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="备用名称" v-if="selectedCert?.subject.altNames?.length">
          <el-tag v-for="(name, index) in selectedCert?.subject.altNames" :key="index" style="margin: 5px">
            {{ name }}
          </el-tag>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>

    <!-- 创建证书对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建证书" width="60%">
      <el-form ref="certFormRef" :model="certForm" label-width="120px" :rules="rules">
        <el-form-item label="通用名称" prop="commonName">
          <el-input v-model="certForm.commonName" placeholder="请输入域名或IP地址" />
        </el-form-item>

        <el-form-item label="备用名称">
          <el-tag
            v-for="(altName, index) in certForm.altNames"
            :key="index"
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
import { createCertificate, genPkcs12 } from '@renderer/api/certificate'
import { CreateCertResult, CertificateCreateData } from '@dto/certificate'
import { deepToRaw } from '@renderer/utils/index'
import { openDirectoryDialog } from '@renderer/api/dialog'
import { saveFile } from '@renderer/api/file'
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

// 复制到剪贴板功能
const copyToClipboard = (text?: string) => {
  if (!text) return

  navigator.clipboard.writeText(text)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
      ElMessage.error('复制失败')
    })
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
  commonName: 'test.example.com',
  country: 'CN',
  state: 'Beijing',
  locality: 'Beijing',
  organization: 'Test Organization',
  organizationUnit: 'IT',
  altNames: ['localhost', '127.0.0.1'],
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

/**
 * 保存证书文件到用户选择的目录
 * @param certResult 证书创建结果
 */
const saveCertificates = async (certResult: CreateCertResult, dirName: string) => {
  // 打开目录选择对话框
  const dirPath = await openDirectoryDialog()
  const certificatePath = `${dirPath}/${dirName}/certificate.pem`
  const privatePath = `${dirPath}/${dirName}/private.key`
  const publicKeyPath = `${dirPath}/${dirName}/public.key`
  const p12Path = `${dirPath}/${dirName}/certificate.p12`

  if (dirPath) {
    try {
      // 保存证书文件
      await saveFile(certificatePath, certResult.pem.certificate, {
        force: true
      })
      await saveFile(privatePath, certResult.pem.privateKey, {
        force: true
      })
      await saveFile(publicKeyPath, certResult.pem.publicKey, { force: true })

      // 生成证书文件 pkcs12
      await genPkcs12(
        p12Path,
        privatePassword.value,
        certResult.pem.privateKey,
        certResult.pem.certificate,
        friendlyName.value
      )

      ElMessage.success(`证书已保存到 ${dirPath}`)
    } catch (error: any) {
      console.error('保存证书文件时出错:', error)
      ElMessage.error('保存证书文件失败' + error.message)
    }
  }
}

// 创建证书
const createCert = async () => {
  if (!certFormRef.value) return

  await certFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        creating.value = true
        const form = deepToRaw(certForm.value)
        console.log(form)

        // 生成文件夹名
        const dirName = `${certForm.value.commonName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_cert`
        const result = await createCertificate(form)

        if (result) {
          ElMessage.success('证书创建成功')
          certificate.value = result
          createDialogVisible.value = false
          console.log(result)

          // 保存证书到本地
          await saveCertificates(result, dirName)

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

.cert-info-container {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.code-block {
  position: relative;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.code-block pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.code-block .el-button {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
