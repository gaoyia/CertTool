import { ipcMain, dialog } from 'electron'
import MainWindow from '../../window/MainWindow'

// 打开目录选择对话框
ipcMain.handle('open-directory-dialog', async () => {
  try {
    if (!MainWindow.win) {
      throw new Error('未找到主窗口')
    }
    const result = await dialog.showOpenDialog(MainWindow.win, {
      properties: ['openDirectory', 'createDirectory'],
      title: '选择保存证书的目录'
    })

    if (result.canceled) {
      return null
    }

    return result.filePaths[0]
  } catch (error) {
    console.error('打开目录选择对话框时出错:', error)
    throw error
  }
})
