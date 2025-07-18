import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { writeFile, readFile, deleteFile, fileExists } from '../../utility/file'
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
    filePath: string,
    content: string,
    options?: object
  ): Promise<void> => {
    return writeFile(filePath, content, options)
  }
)

// 读取文件
ipcMain.handle(
  'read-file',
  async (
    _event: IpcMainInvokeEvent,
    filePath: string
  ): Promise<string | Buffer<ArrayBufferLike>> => {
    return await readFile(filePath, { encoding: 'utf-8' })
  }
)

// 检查文件是否存在
ipcMain.handle(
  'file-exists',
  async (_event: IpcMainInvokeEvent, filePath: string): Promise<boolean> => {
    try {
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
  async (_event: IpcMainInvokeEvent, filePath: string): Promise<void> => {
    await deleteFile(filePath)
  }
)

// 获取应用数据目录路径
ipcMain.handle('get-app-data-path', (_event: IpcMainInvokeEvent): string => {
  return getAppDataPath()
})

// 获取路径
type GetPathParams = Parameters<typeof app.getPath>[0]
ipcMain.handle('getPath', (_event: IpcMainInvokeEvent, name: GetPathParams): string => {
  return app.getPath(name)
})
