import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { writeFile, readFile, deleteFile, fileExists, FileResult } from '../../utility/file'
import path from 'path'
import { app } from 'electron'

// 获取应用数据目录
const getAppDataPath = (): string => {
  return path.join(app.getPath('userData'), 'certificates')
}

// 保存文件
ipcMain.handle(
  'save-file',
  async (
    _event: IpcMainInvokeEvent,
    fileName: string,
    content: string,
    options?: { force?: boolean }
  ): Promise<FileResult> => {
    try {
      const filePath = path.join(getAppDataPath(), fileName)
      const result = await writeFile(filePath, content, {
        force: options?.force || false,
        encoding: 'utf-8'
      })
      return result
    } catch (error) {
      return {
        success: false,
        message: `保存文件时发生错误: ${(error as Error).message}`
      }
    }
  }
)

// 读取文件
ipcMain.handle(
  'read-file',
  async (
    _event: IpcMainInvokeEvent,
    fileName: string
  ): Promise<FileResult<string | Buffer<ArrayBufferLike>>> => {
    try {
      const filePath = path.join(getAppDataPath(), fileName)
      const result = await readFile(filePath, { encoding: 'utf-8' })
      return result
    } catch (error) {
      return {
        success: false,
        message: `读取文件时发生错误: ${(error as Error).message}`,
        data: ''
      }
    }
  }
)

// 检查文件是否存在
ipcMain.handle(
  'file-exists',
  async (_event: IpcMainInvokeEvent, fileName: string): Promise<boolean> => {
    try {
      const filePath = path.join(getAppDataPath(), fileName)
      return await fileExists(filePath)
    } catch (error) {
      console.error(`检查文件是否存在时发生错误: ${(error as Error).message}`)
      return false
    }
  }
)

// 删除文件
ipcMain.handle(
  'delete-file',
  async (_event: IpcMainInvokeEvent, fileName: string): Promise<FileResult> => {
    try {
      const filePath = path.join(getAppDataPath(), fileName)
      return await deleteFile(filePath)
    } catch (error) {
      return {
        success: false,
        message: `删除文件时发生错误: ${(error as Error).message}`
      }
    }
  }
)

// 获取应用数据目录路径
ipcMain.handle('get-app-data-path', (_event: IpcMainInvokeEvent): string => {
  return getAppDataPath()
})
