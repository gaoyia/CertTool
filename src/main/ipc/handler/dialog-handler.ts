import { ipcMain, dialog, OpenDialogOptions, SaveDialogOptions } from 'electron'
import MainWindow from '../../window/MainWindow'

// 打开目录选择对话框
ipcMain.handle(
  'open-dialog',
  async (
    _event: Electron.IpcMainInvokeEvent,
    options: OpenDialogOptions = {
      properties: ['openDirectory', 'createDirectory'],
      title: '选择保存证书的目录'
    }
  ) => {
    try {
      if (!MainWindow.win) {
        throw new Error('未找到主窗口')
      }
      const result = await dialog.showOpenDialog(MainWindow.win, options)

      if (result.canceled) {
        return null
      }

      return result.filePaths[0]
    } catch (error) {
      console.error('打开目录选择对话框时出错:', error)
      throw error
    }
  }
)

// 打开保存文件对话框
ipcMain.handle(
  'save-dialog',
  async (
    _event: Electron.IpcMainInvokeEvent,
    options: SaveDialogOptions = {
      title: '保存文件',
      buttonLabel: '保存',
      properties: ['createDirectory', 'showOverwriteConfirmation']
    }
  ) => {
    try {
      if (!MainWindow.win) {
        throw new Error('未找到主窗口')
      }
      const result = await dialog.showSaveDialog(MainWindow.win, options)

      if (result.canceled) {
        return null
      }

      return result.filePath
    } catch (error) {
      console.error('打开保存文件对话框时出错:', error)
      throw error
    }
  }
)
