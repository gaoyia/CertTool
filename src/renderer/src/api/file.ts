const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts'
// ?
// : '/etc/hosts'
/**
 * 保存文件到应用数据目录
 * @param filePath 文件名
 * @param content 文件内容
 * @param options 选项
 * @returns 保存结果
 */
export const saveFile = async (
  filePath: string,
  content: string,
  options?: { force?: boolean }
): Promise<void> => {
  return await window.electron.ipcRenderer.invoke('save-file', filePath, content, options)
}

/**
 * 读取应用数据目录中的文件
 * @param fileName 文件名
 * @returns 读取结果
 */
export const readFile = async (fileName: string): Promise<Buffer<ArrayBufferLike>> => {
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
export const deleteFile = async (fileName: string): Promise<void> => {
  return await window.electron.ipcRenderer.invoke('delete-file', fileName)
}

/**
 * 获取应用数据目录路径
 * @returns 应用数据目录路径
 */
export const getAppDataPath = async (): Promise<string> => {
  return await window.electron.ipcRenderer.invoke('get-app-data-path')
}

/**
 * 获取系统路径
 * @param name 路径名称
 * @returns 系统路径
 */
export const getPath = async (name: string): Promise<string> => {
  return await window.electron.ipcRenderer.invoke('getPath', name)
}

/**
 * 读取hosts文件
 * @returns hosts文件内容
 */
export const readHostsFile = async (): Promise<string> => {
  return await window.electron.ipcRenderer.invoke('read-file', hostsPath)
}

/**
 * 保存hosts文件
 * @param content hosts文件内容
 * @returns 保存结果
 */
export const saveHostsFile = async (content: string): Promise<void> => {
  return await window.electron.ipcRenderer.invoke('save-file', hostsPath, content)
}

/**
 * 使用PowerShell读取hosts文件
 * @returns hosts文件内容
 */
export const readHostsFileWithPowerShell = async (): Promise<string> => {
  return await window.electron.ipcRenderer.invoke('read-file-with-powershell', hostsPath)
}
