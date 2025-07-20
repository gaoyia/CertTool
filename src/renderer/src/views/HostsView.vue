<template>
  <div class="hosts-view">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
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
import { readHostsFile, saveHostsFile } from '../api/file'

const editorContainer: Ref<Element | null> = ref<Element | null>(null)
let view: EditorView | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimeout: number | null = null

// 状态变量
const isLoading = ref(false)
const isSaving = ref(false)
const isLoadingPS = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

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
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const content = await readHostsFile()
    // 更新编辑器内容
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content }
    })
    if (showTips) {
      successMessage.value = 'Hosts文件加载成功'
    }
  } catch (error) {
    console.error('读取hosts文件失败:', error)
    if (showTips) {
      errorMessage.value = `读取hosts文件失败: ${error instanceof Error ? error.message : String(error)}`
    }
  } finally {
    isLoading.value = false
    if (showTips) {
      // 3秒后清除成功消息
      if (successMessage.value) {
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      }
    }
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
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const content = view.state.doc.toString()
    await saveHostsFile(content)
    successMessage.value = 'Hosts文件保存成功'
    await loadHostsFile(false)
  } catch (error) {
    console.error('保存hosts文件失败:', error)
    errorMessage.value = `保存hosts文件失败: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    isSaving.value = false

    // 3秒后清除成功消息
    if (successMessage.value) {
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  }
}

onMounted(async () => {
  if (editorContainer.value) {
    view = new EditorView({
      doc: '',
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

    // 加载hosts文件
    await loadHostsFile()
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
.hosts-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.editor-container {
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 确保CodeMirror编辑器填满容器 */
.editor-container :deep(.cm-editor) {
  height: 100%;
}

/* 确保CodeMirror内容区域可以滚动 */
.editor-container :deep(.cm-scroller) {
  overflow: auto;
}

.hosts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.actions {
  display: flex;
}

.save-button,
.reload-button,
.powershell-button {
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
  color: white;
}

.save-button {
  background-color: #4caf50;
}

.save-button:hover {
  background-color: #45a049;
}

.save-button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.reload-button {
  background-color: #2196f3;
}

.reload-button:hover {
  background-color: #0b7dda;
}

.reload-button:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

.powershell-button {
  background-color: #5c2d91;
}

.powershell-button:hover {
  background-color: #4a2276;
}

.powershell-button:disabled {
  background-color: #9d8bb0;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  padding: 8px;
  background-color: #ffebee;
  border-radius: 4px;
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  top: -15px;
}

.success-message {
  color: #4caf50;
  padding: 8px;
  background-color: #e8f5e9;
  border-radius: 4px;
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  top: -15px;
}
</style>
