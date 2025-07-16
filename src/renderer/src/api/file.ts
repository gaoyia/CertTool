/**
 * 文件操作结果接口
 */
export interface FileResult<T = void> {
  success: boolean
  message: string
  data?: T
}
/**
 * 保存文件到应用数据目录
 * @param fileName 文件名
 * @param content 文件内容
 * @param options 选项
 * @returns 保存结果
 */
export const saveFile = async (
  fileName: string,
  content: string,
  options?: { force?: boolean }
): Promise<FileResult> => {
  return await window.electron.ipcRenderer.invoke('save-file', fileName, content, options)
}

/**
 * 读取应用数据目录中的文件
 * @param fileName 文件名
 * @returns 读取结果
 */
export const readFile = async (fileName: string): Promise<FileResult<string>> => {
  return await window.electron.ipcRenderer.invoke('read-file', fileName)
}

/**
 * 检查文件是否存在
 * @param fileName 文件名
 * @returns 是否存在
 */
export const fileExists = async (fileName: string): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('file-exists', fileName)
}

/**
 * 删除文件
 * @param fileName 文件名
 * @returns 删除结果
 */
export const deleteFile = async (fileName: string): Promise<FileResult> => {
  return await window.electron.ipcRenderer.invoke('delete-file', fileName)
}

/**
 * 获取应用数据目录路径
 * @returns 应用数据目录路径
 */
export const getAppDataPath = async (): Promise<string> => {
  return await window.electron.ipcRenderer.invoke('get-app-data-path')
}
