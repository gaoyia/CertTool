<template>
  <div class="hosts-view">
    <div class="hosts-header">
      <h1>Hosts 文件编辑器</h1>
      <div class="actions">
        <button @click="saveHostsFileHandler" :disabled="isSaving" class="save-button">
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
        <button @click="reloadHostsFile" :disabled="isLoading" class="reload-button">
          {{ isLoading ? '加载中...' : '重新加载' }}
        </button>
      </div>
    </div>

    <div
      ref="editorContainer"
      v-loading="isLoading || isSaving || isLoadingPS"
      class="editor-container"
      element-loading-text="加载中..."
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { EditorState } from '@codemirror/state'
import {
  EditorView,
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter
} from '@codemirror/view'
import 'element-plus/es/components/loading/style/css'
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap
} from '@codemirror/language'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches, search } from '@codemirror/search'
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap
} from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'

import { onMounted, onUnmounted, Ref, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { readHostsFile, saveHostsFile } from '../api/file'

const editorContainer: Ref<Element | null> = ref<Element | null>(null)
let view: EditorView | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimeout: number | null = null

// 状态变量
const isLoading = ref(false)
const isSaving = ref(false)
const isLoadingPS = ref(false)

// 调整编辑器高度的函数
const adjustEditorHeight = () => {
  if (!editorContainer.value || !view) return

  // 清除之前的超时以防止多次调用
  if (resizeTimeout !== null) {
    window.clearTimeout(resizeTimeout)
  }

  // 使用setTimeout来防止频繁调整
  resizeTimeout = window.setTimeout(() => {
    // 编辑器已经通过CSS设置为填满容器，不需要额外的高度设置
    // 但我们可以在这里添加任何需要的额外逻辑

    // 通知CodeMirror编辑器更新其布局
    view?.requestMeasure()
  }, 100)
}

// 设置窗口大小变化监听
const setupResizeListener = () => {
  // 监听窗口大小变化
  window.addEventListener('resize', adjustEditorHeight)

  // 使用ResizeObserver监听容器大小变化
  if (editorContainer.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(adjustEditorHeight)
    resizeObserver.observe(editorContainer.value)
  }
}

// 读取hosts文件
const loadHostsFile = async (showTips: boolean = true) => {
  if (!view) return

  isLoading.value = true

  try {
    const content = await readHostsFile()
    // 更新编辑器内容
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content }
    })
    if (showTips) {
      ElNotification({
        title: '成功',
        message: 'Hosts文件加载成功',
        type: 'success',
        position: 'top-left',
        duration: 3000
      })
    }
  } catch (error) {
    console.error('读取hosts文件失败:', error)
    if (showTips) {
      ElNotification({
        title: '错误',
        message: `读取hosts文件失败: ${error instanceof Error ? error.message : String(error)}`,
        position: 'top-left',
        type: 'error',
        duration: 5000
      })
    }
  } finally {
    isLoading.value = false
  }
}

// 重新加载hosts文件
const reloadHostsFile = async () => {
  await loadHostsFile()
}

// 保存hosts文件
const saveHostsFileHandler = async () => {
  if (!view) return
  if (isLoading.value || isSaving.value) return

  isSaving.value = true

  try {
    const content = view.state.doc.toString()
    await saveHostsFile(content)
    ElNotification({
      title: '成功',
      message: 'Hosts文件保存成功',
      position: 'top-left',
      type: 'success',
      duration: 3000
    })
    await loadHostsFile(false)
  } catch (error) {
    console.error('保存hosts文件失败:', error)
    ElNotification({
      title: '错误',
      message: `保存hosts文件失败: ${error instanceof Error ? error.message : String(error)}`,
      position: 'top-left',
      type: 'error',
      duration: 5000
    })
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  if (editorContainer.value) {
    let content = ''
    try {
      content = await readHostsFile()
    } catch (error) {
      console.error('读取hosts文件失败:', error)
      ElNotification({
        title: '错误',
        message: `读取hosts文件失败: ${error instanceof Error ? error.message : String(error)}`,
        position: 'top-left',
        type: 'error',
        duration: 5000
      })
    }
    view = new EditorView({
      doc: content,
      parent: editorContainer.value,
      extensions: [
        // A line number gutter
        lineNumbers(),
        // A gutter with code folding markers
        foldGutter(),
        // Replace non-printable characters with placeholders
        highlightSpecialChars(),
        // The undo history
        history(),
        // Replace native cursor/selection with our own
        drawSelection(),
        // Show a drop cursor when dragging over the editor
        dropCursor(),
        // Allow multiple cursors/selections
        EditorState.allowMultipleSelections.of(true),
        // Re-indent lines when typing specific input
        indentOnInput(),
        // Highlight syntax with a default style
        syntaxHighlighting(defaultHighlightStyle),
        // Highlight matching brackets near cursor
        bracketMatching(),
        // Automatically close brackets
        closeBrackets(),
        // Load the autocompletion system
        autocompletion(),
        // Allow alt-drag to select rectangular regions
        rectangularSelection(),
        // Change the cursor to a crosshair when holding alt
        crosshairCursor(),
        // Style the current line specially
        highlightActiveLine(),
        // Style the gutter for current line specially
        highlightActiveLineGutter(),
        // Highlight text that matches the selected text
        highlightSelectionMatches(),
        keymap.of([
          // Closed-brackets aware backspace
          ...closeBracketsKeymap,
          // A large set of basic bindings
          ...defaultKeymap,
          // Search-related keys
          ...searchKeymap,
          // Redo/undo keys
          ...historyKeymap,
          // Code folding bindings
          ...foldKeymap,
          // Autocompletion keys
          ...completionKeymap,
          // Keys related to the linter system
          ...lintKeymap,
          {
            key: 'Ctrl-s',
            run: () => {
              saveHostsFileHandler().then(() => {})
              return true
            }
          }
        ]),
        search({ top: true }),
        // 添加滚动条配置
        EditorView.theme({
          '&': {
            height: '100%',
            maxHeight: '100%'
          },
          '.cm-scroller': {
            overflow: 'auto'
          }
        })
      ]
    })

    // 设置调整大小的监听器
    setupResizeListener()

    // 初始调整一次高度
    adjustEditorHeight()
  }
})

// 在组件卸载时清理
onUnmounted(() => {
  // 清理窗口大小变化监听器
  window.removeEventListener('resize', adjustEditorHeight)

  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  // 清理超时
  if (resizeTimeout !== null) {
    window.clearTimeout(resizeTimeout)
    resizeTimeout = null
  }

  // 销毁编辑器视图
  if (view) {
    view.destroy()
    view = null
  }
})
</script>

<style scoped>
/* 紧凑Hosts编辑页面 */
.hosts-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.editor-container {
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  margin: 1rem;
}

/* 紧凑编辑器样式 */
.editor-container :deep(.cm-editor) {
  height: 100%;
  border-radius: 0.375rem;
}

.editor-container :deep(.cm-scroller) {
  overflow: auto;
}

.editor-container :deep(.cm-gutters) {
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
  color: #64748b;
}

.editor-container :deep(.cm-lineNumbers) {
  font-size: 0.75rem;
}

.editor-container :deep(.cm-content) {
  font-family: 'Consolas', 'Monaco', 'Lucida Console', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
}

.hosts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

.hosts-header h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.hosts-header h1::before {
  content: '';
  width: 3px;
  height: 1.25rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 2px;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.save-button,
.reload-button,
.powershell-button {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.save-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.save-button:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
  opacity: 0.7;
}

.reload-button {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
}

.reload-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.reload-button:disabled {
  background: #90caf9;
  cursor: not-allowed;
  opacity: 0.7;
}

.powershell-button {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: white;
}

.powershell-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
}

.powershell-button:disabled {
  background: #9d8bb0;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 紧凑加载状态 */
:deep(.el-loading-mask) {
  border-radius: 0.375rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hosts-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .actions {
    justify-content: space-between;
  }

  .editor-container {
    margin: 0.75rem;
  }
}
</style>
