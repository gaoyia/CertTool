/**
 * 打开目录选择对话框
 * @returns 选择的目录路径，如果用户取消则返回null
 */
export const openDirectoryDialog = async (): Promise<string | null> => {
  return await window.electron.ipcRenderer.invoke('open-directory-dialog')
}
