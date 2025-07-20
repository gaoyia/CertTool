import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { writeFile, readFile, deleteFile, fileExists } from '../../utility/file'
import path from 'path'
import os from 'os'
import { app } from 'electron'
import { exec } from 'child_process'
import { promisify } from 'util'
import { v4 as uuidv4 } from 'uuid'
import { execSync } from 'child_process'

// 将exec转换为Promise版本
const execPromise = promisify(exec)

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
    try {
      return await writeFile(filePath, content, options)
    } catch (error: any) {
      // 把要写入的内容放到一个临时文件里，避免命令行长度/转义问题
      if (error.code === 'EPERM') {
        // 创建临时文件路径
        const tempFilePath = path.join(os.tmpdir(), `CertTool-${uuidv4()}.tmp`)

        try {
          // 写入临时文件
          await writeFile(tempFilePath, content)

          // 使用PowerShell以管理员权限复制文件

          const sourcePath = tempFilePath.replace(/'/g, "''")
          const destPath = filePath.replace(/'/g, "''")

          const psCommand = `
$sourcePath = '${sourcePath}'
$destPath   = '${destPath}'
if (-not (Test-Path $sourcePath)) { throw "源文件不存在：$sourcePath" }
Copy-Item -Path $sourcePath -Destination $destPath -Force
`.trim()

          const base64 = Buffer.from(psCommand, 'utf16le').toString('base64')

          execSync(
            `powershell -NoProfile -Command "Start-Process powershell -Verb RunAs -WindowStyle Hidden -ArgumentList '-NoProfile','-EncodedCommand','${base64}' -Wait"`,
            {
              windowsHide: true, // 关键：隐藏窗口
              stdio: 'pipe' // 避免继承主进程控制台
            }
          )

          // 到这里提权进程已结束，可以安全删临时文件
          await deleteFile(tempFilePath)

          console.log(3)
          console.log(`文件已通过提升权限方式保存到: ${filePath}`)
        } catch (elevatedError: any) {
          // 清理临时文件
          try {
            if (await fileExists(tempFilePath)) {
              await deleteFile(tempFilePath)
            }
          } catch (cleanupError: any) {
            console.error('清理临时文件失败:', cleanupError)
          }
          throw new Error(`${elevatedError.message}`)
        }
      } else {
        throw error
      }
    }
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

// 使用PowerShell读取文件
ipcMain.handle(
  'read-file-with-powershell',
  async (_event: IpcMainInvokeEvent, filePath: string): Promise<string> => {
    console.log(`使用PowerShell读取文件: ${filePath}`)

    // 使用PowerShell读取文件
    const { stdout, stderr } = await execPromise(
      `powershell -Command "Get-Content -Path '${filePath}' -Raw"`
    )
    console.log(stderr)

    if (stderr) {
      throw new Error(`PowerShell错误: ${stderr}`)
    }
    console.log(stdout)

    return stdout
  }
)
