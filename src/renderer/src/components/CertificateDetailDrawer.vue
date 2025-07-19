<template>
  <el-drawer
    v-model="drawerVisibleComputed"
    title="证书详细信息"
    size="50%"
    @closed="onDrawerClosed"
  >
    <div style="margin-bottom: 15px; text-align: right">
      <el-dropdown split-button type="primary" size="small" @click="exportAll('all')">
        批量导出
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="exportAll('cert')">
              <el-icon><download /></el-icon> 导出证书文件
            </el-dropdown-item>
            <el-dropdown-item @click="exportAll('private')">
              <el-icon><download /></el-icon> 导出私钥文件
            </el-dropdown-item>
            <el-dropdown-item @click="exportAll('public')">
              <el-icon><download /></el-icon> 导出公钥文件
            </el-dropdown-item>
            <el-dropdown-item @click="exportAll('p12')">
              <el-icon><download /></el-icon> 导出P12文件
            </el-dropdown-item>
            <el-dropdown-item divided @click="exportAll('all')">
              <el-icon><download /></el-icon> 导出全部文件
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-tabs>
      <el-tab-pane label="证书">
        <div class="code-block">
          <pre>{{ certificate?.pem.certificate }}</pre>
          <div class="button-group">
            <el-dropdown
              split-button
              type="primary"
              size="small"
              @click="copyToClipboard(certificate?.pem.certificate)"
            >
              复制
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="exportCertificate('pem')">
                    <el-icon><download /></el-icon> 导出为 PEM (.pem)
                  </el-dropdown-item>
                  <el-dropdown-item @click="exportCertificate('crt')">
                    <el-icon><download /></el-icon> 导出为 CRT (.crt)
                  </el-dropdown-item>
                  <el-dropdown-item @click="exportCertificate('cer')">
                    <el-icon><download /></el-icon> 导出为 CER (.cer)
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="私钥">
        <div class="code-block">
          <pre>{{ certificate?.pem.privateKey }}</pre>
          <div class="button-group">
            <el-dropdown
              split-button
              type="primary"
              size="small"
              @click="copyToClipboard(certificate?.pem.privateKey)"
            >
              复制
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="exportPrivateKey('pem')">
                    <el-icon><download /></el-icon> 导出为 PEM (.pem)
                  </el-dropdown-item>
                  <el-dropdown-item @click="exportPrivateKey('key')">
                    <el-icon><download /></el-icon> 导出为 KEY (.key)
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="公钥">
        <div class="code-block">
          <pre>{{ certificate?.pem.publicKey }}</pre>
          <div class="button-group">
            <el-dropdown
              split-button
              type="primary"
              size="small"
              @click="copyToClipboard(certificate?.pem.publicKey)"
            >
              复制
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="exportPublicKey('pem')">
                    <el-icon><download /></el-icon> 导出为 PEM (.pem)
                  </el-dropdown-item>
                  <el-dropdown-item @click="exportPublicKey('key')">
                    <el-icon><download /></el-icon> 导出为 KEY (.key)
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="P12信息">
        <div class="p12-info">
          <fieldset>
            <legend>P12文件信息</legend>
            <el-dropdown
              split-button
              style="float: right"
              type="primary"
              size="small"
              @click="exportP12()"
            >
              导出P12文件
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="exportP12()">
                    <el-icon><download /></el-icon> 导出P12文件
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <p><strong>私钥密码:</strong> {{ privatePassword }}</p>
            <p><strong>友好名称:</strong> {{ friendlyName }}</p>
          </fieldset>
        </div>
      </el-tab-pane>

      <el-tab-pane v-if="certificate?.subject.altNames?.length" label="备用名称">
        <el-tag
          v-for="(name, index) in certificate?.subject.altNames"
          :key="index"
          style="margin: 5px"
        >
          {{ name }}
        </el-tag>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown, DocumentCopy, Download } from '@element-plus/icons-vue'
import { CreateCertResult } from '@dto/certificate'
import { openDirectoryDialog, saveFileDialog } from '@renderer/api/dialog'
import { saveFile } from '@renderer/api/file'
import { genPkcs12 } from '@renderer/api/certificate'

// 定义props
const props = defineProps<{
  visible: boolean
  certificate: CreateCertResult | null
  privatePassword: string
  friendlyName: string
}>()

// 定义emit
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'export-success': [type: string, path: string]
}>()

// 计算属性：双向绑定抽屉可见性
const drawerVisibleComputed = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 抽屉关闭事件
const onDrawerClosed = () => {
  emit('update:visible', false)
}

// 复制到剪贴板功能
const copyToClipboard = (text?: string) => {
  if (!text) return

  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch((err) => {
      console.error('复制失败:', err)
      ElMessage.error('复制失败')
    })
}

// 批量导出功能
const exportAll = async (type: 'cert' | 'private' | 'public' | 'p12' | 'all') => {
  if (!props.certificate) return

  // 选择目标文件夹
  const folderPath = await openDirectoryDialog({
    title: '选择导出文件夹',
    properties: ['openDirectory', 'createDirectory'],
    buttonLabel: '选择'
  })

  if (!folderPath) return
  const targetDir = folderPath

  try {
    const promises: Promise<void>[] = []

    if (type === 'cert' || type === 'all') {
      promises.push(
        exportCertificate('pem', `${targetDir}/certificate.pem`),
        exportCertificate('crt', `${targetDir}/certificate.crt`),
        exportCertificate('cer', `${targetDir}/certificate.cer`)
      )
    }

    if (type === 'private' || type === 'all') {
      promises.push(
        exportPrivateKey('pem', `${targetDir}/private_key.pem`),
        exportPrivateKey('key', `${targetDir}/private_key.key`)
      )
    }

    if (type === 'public' || type === 'all') {
      promises.push(
        exportPublicKey('pem', `${targetDir}/public_key.pem`),
        exportPublicKey('key', `${targetDir}/public_key.key`)
      )
    }

    if (type === 'p12' || type === 'all') {
      promises.push(exportP12(`${targetDir}/certificate.p12`))
    }

    await Promise.all(promises)
    ElMessage.success(`文件已成功导出到: ${targetDir}`)
  } catch (error: any) {
    console.error('批量导出时出错:', error)
    ElMessage.error('批量导出失败: ' + error.message)
  }
}

// 修改导出方法以接受可选的文件路径参数
const exportCertificate = async (format: 'pem' | 'crt' | 'cer', filePath?: string) => {
  if (!props.certificate) return
  const defaultFileName = `certificate.${format}`
  const finalPath = filePath || (await getSavePath('证书文件', format, defaultFileName))
  if (!finalPath) return

  try {
    await saveFile(finalPath, props.certificate.pem.certificate)
    ElMessage.success(`证书文件已成功导出到: ${finalPath}`)
    emit('export-success', 'cert', finalPath)
  } catch (error: any) {
    console.error('导出证书文件时出错:', error)
    ElMessage.error('导出证书文件失败: ' + error.message)
  }
}

const exportPrivateKey = async (format: 'pem' | 'key', filePath?: string) => {
  if (!props.certificate) return
  const defaultFileName = `private_key.${format}`
  const finalPath = filePath || (await getSavePath('私钥文件', format, defaultFileName))
  if (!finalPath) return

  try {
    await saveFile(finalPath, props.certificate.pem.privateKey)
    ElMessage.success(`私钥文件已成功导出到: ${finalPath}`)
    emit('export-success', 'private', finalPath)
  } catch (error: any) {
    console.error('导出私钥文件时出错:', error)
    ElMessage.error('导出私钥文件失败: ' + error.message)
  }
}

const exportPublicKey = async (format: 'pem' | 'key', filePath?: string) => {
  if (!props.certificate) return
  const defaultFileName = `public_key.${format}`
  const finalPath = filePath || (await getSavePath('公钥文件', format, defaultFileName))
  if (!finalPath) return

  try {
    await saveFile(finalPath, props.certificate.pem.publicKey)
    ElMessage.success(`公钥文件已成功导出到: ${finalPath}`)
    emit('export-success', 'public', finalPath)
  } catch (error: any) {
    console.error('导出公钥文件时出错:', error)
    ElMessage.error('导出公钥文件失败: ' + error.message)
  }
}

const exportP12 = async (filePath?: string) => {
  if (!props.certificate) return
  const defaultFileName = 'certificate.p12'
  const finalPath = filePath || (await getSavePath('P12证书文件', 'p12', defaultFileName))
  if (!finalPath) return
  console.log(
    finalPath,
    props.privatePassword,
    props.certificate.pem.privateKey,
    props.certificate.pem.certificate,
    props.friendlyName
  )

  try {
    await genPkcs12(
      finalPath,
      props.privatePassword,
      props.certificate.pem.privateKey,
      props.certificate.pem.certificate,
      props.friendlyName
    )
    ElMessage.success(`P12文件已成功导出到: ${finalPath}`)
    emit('export-success', 'p12', finalPath)
  } catch (error: any) {
    console.error('导出P12文件时出错:', error)
    ElMessage.error('导出P12文件失败: ' + error.message)
  }
}

// 获取保存路径的公共方法
const getSavePath = async (title: string, format: string, defaultFileName: string) => {
  const filePath = await saveFileDialog({
    title: `保存${title}`,
    defaultPath: defaultFileName,
    filters: [
      { name: `${title}`, extensions: [format] },
      { name: '所有文件', extensions: ['*'] }
    ],
    buttonLabel: '导出'
  })
  return filePath
}
</script>

<style scoped>
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

.button-group {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

.p12-info {
  padding: 15px;
}

.p12-info fieldset {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.p12-info legend {
  padding: 0 10px;
  font-weight: bold;
}
</style>
