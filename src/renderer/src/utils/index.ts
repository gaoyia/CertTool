import { ElMessage } from 'element-plus'
import { reactive, toRaw, isReactive, isRef, ref, shallowReactive } from 'vue'

export function deepToRaw(obj) {
  if (isRef(obj)) {
    obj = obj.value // 如果是 ref，取其 value
  }
  if (isReactive(obj) || shallowReactive(obj)) {
    // 处理 reactive 和 shallowReactive
    obj = toRaw(obj)
  }
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        obj[key] = deepToRaw(obj[key])
      }
    }
  }
  return obj
}

// 复制到剪贴板
export const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}
