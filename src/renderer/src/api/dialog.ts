/**
 * 打开目录选择对话框
 * @param options 对话框选项
 * @returns 选择的目录路径，如果用户取消则返回null
 */
export const openDirectoryDialog = async (options = {}): Promise<string | null> => {
  return await window.electron.ipcRenderer.invoke('open-dialog', options)
}

/**
 * 打开保存文件对话框
 * @param options 保存对话框选项
 * @returns 选择的文件路径，如果用户取消则返回null
 */
export const saveFileDialog = async (options = {}): Promise<string | null> => {
  return await window.electron.ipcRenderer.invoke('save-dialog', options)
}
