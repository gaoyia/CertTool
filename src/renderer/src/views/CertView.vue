<template>
  <div class="cert">
    <h1>证书管理</h1>

    <!-- 证书列表 -->
    <div class="action">
      <el-button type="primary" @click="showCreateDialog">创建证书</el-button>
    </div>

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
import {
  createCertificate,
  type Certificate,
  type CertificateInfo
} from '@renderer/api/certificate'
import { deepToRaw } from '@renderer/utils/index'
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
        // const fileName = `${certForm.value.commonName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.cert`
        const result = await createCertificate(deepToRaw(certForm.value))

        if (result.success && result.data) {
          ElMessage.success('证书创建成功')
          certificates.value.push(result.data.certObject)
          createDialogVisible.value = false
          console.log(result);

          // TODO: 弹窗获取路径

          // TODO: 保存证书到本地


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
</style>
