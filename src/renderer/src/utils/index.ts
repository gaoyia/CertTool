import { ElMessage } from 'element-plus'
import { toRaw, isReactive, isRef, isProxy } from 'vue'

export function deepToRaw(obj) {
  // 处理原始值
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  // 处理 ref
  if (isRef(obj)) {
    obj = obj.value
  }
  // 处理响应式对象
  if (isReactive(obj) || isProxy(obj)) {
    // isProxy 可以检测更多代理类型
    obj = toRaw(obj)
  }
  // 只处理普通对象和数组
  if (Object.prototype.toString.call(obj) === '[object Object]' || Array.isArray(obj)) {
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
