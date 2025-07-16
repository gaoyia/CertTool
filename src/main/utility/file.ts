import fs from 'fs/promises'
import { constants } from 'fs'
import path from 'path'

/**
 * 文件操作结果接口
 */
export interface FileResult<T = void> {
  success: boolean
  message: string
  data?: T
}

/**
 * 文件写入选项
 */
export interface WriteFileOptions {
  /**
   * 是否强制写入（覆盖已存在的文件）
   * @default false
   */
  force?: boolean

  /**
   * 文件编码
   * @default 'utf-8'
   */
  encoding?: BufferEncoding

  /**
   * 重试次数（当文件被占用时）
   * @default 3
   */
  retries?: number

  /**
   * 重试间隔（毫秒）
   * @default 100
   */
  retryInterval?: number
}

/**
 * 文件读取选项
 */
export interface ReadFileOptions {
  /**
   * 文件编码
   * @default 'utf-8'
   */
  encoding?: BufferEncoding
}

/**
 * 确保目录存在，如果不存在则创建
 * @param dirPath 目录路径
 */
export async function ensureDir(dirPath: string): Promise<FileResult> {
  try {
    await fs.mkdir(dirPath, { recursive: true })
    return { success: true, message: '目录创建成功或已存在' }
  } catch (error) {
    return {
      success: false,
      message: `创建目录失败: ${(error as Error).message}`
    }
  }
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

/**
 * 写入文件
 * @param filePath 文件路径
 * @param data 文件内容
 * @param options 写入选项
 */
export async function writeFile(
  filePath: string,
  data: string | Buffer | Uint8Array,
  options: WriteFileOptions = {}
): Promise<FileResult> {
  const { force = false, encoding = 'utf-8', retries = 3, retryInterval = 100 } = options

  // 确保目录存在
  const dirPath = path.dirname(filePath)
  const dirResult = await ensureDir(dirPath)
  if (!dirResult.success) {
    return dirResult
  }

  // 检查文件是否存在（如果不强制写入）
  if (!force) {
    const exists = await fileExists(filePath)
    if (exists) {
      return {
        success: false,
        message: `文件已存在: ${filePath}。如需覆盖，请使用 force: true 选项`
      }
    }
  }

  // 尝试写入文件，支持重试
  let attempt = 0
  let lastError: Error | null = null

  while (attempt <= retries) {
    try {
      await fs.writeFile(filePath, data, { encoding })
      return {
        success: true,
        message: `文件写入成功: ${filePath}`
      }
    } catch (error) {
      lastError = error as Error

      // 如果是文件被占用错误 (EBUSY) 或权限错误 (EPERM)，则重试
      if (
        (error as NodeJS.ErrnoException).code === 'EBUSY' ||
        (error as NodeJS.ErrnoException).code === 'EPERM'
      ) {
        attempt++
        if (attempt <= retries) {
          await new Promise((resolve) => setTimeout(resolve, retryInterval))
          continue
        }
      }

      // 其他错误或重试次数已用完，直接返回错误
      break
    }
  }

  return {
    success: false,
    message: `文件写入失败: ${lastError?.message || '未知错误'}`
  }
}

/**
 * 读取文件
 * @param filePath 文件路径
 * @param options 读取选项
 */
export async function readFile(
  filePath: string,
  options: ReadFileOptions = {}
): Promise<FileResult<string | Buffer>> {
  const { encoding } = options

  try {
    // 检查文件是否存在
    const exists = await fileExists(filePath)
    if (!exists) {
      return {
        success: false,
        message: `文件不存在: ${filePath}`
      }
    }

    // 读取文件
    const data = await fs.readFile(filePath, encoding)
    return {
      success: true,
      message: `文件读取成功: ${filePath}`,
      data
    }
  } catch (error) {
    return {
      success: false,
      message: `文件读取失败: ${(error as Error).message}`
    }
  }
}

/**
 * 删除文件
 * @param filePath 文件路径
 */
export async function deleteFile(filePath: string): Promise<FileResult> {
  try {
    // 检查文件是否存在
    const exists = await fileExists(filePath)
    if (!exists) {
      return {
        success: false,
        message: `文件不存在: ${filePath}`
      }
    }

    // 删除文件
    await fs.unlink(filePath)
    return {
      success: true,
      message: `文件删除成功: ${filePath}`
    }
  } catch (error) {
    return {
      success: false,
      message: `文件删除失败: ${(error as Error).message}`
    }
  }
}

/**
 * 复制文件
 * @param sourcePath 源文件路径
 * @param targetPath 目标文件路径
 * @param options 写入选项
 */
export async function copyFile(
  sourcePath: string,
  targetPath: string,
  options: WriteFileOptions = {}
): Promise<FileResult> {
  try {
    // 检查源文件是否存在
    const exists = await fileExists(sourcePath)
    if (!exists) {
      return {
        success: false,
        message: `源文件不存在: ${sourcePath}`
      }
    }

    // 确保目标目录存在
    const dirPath = path.dirname(targetPath)
    const dirResult = await ensureDir(dirPath)
    if (!dirResult.success) {
      return dirResult
    }

    // 检查目标文件是否存在（如果不强制写入）
    if (!options.force) {
      const targetExists = await fileExists(targetPath)
      if (targetExists) {
        return {
          success: false,
          message: `目标文件已存在: ${targetPath}。如需覆盖，请使用 force: true 选项`
        }
      }
    }

    // 复制文件
    await fs.copyFile(sourcePath, targetPath)
    return {
      success: true,
      message: `文件复制成功: ${sourcePath} -> ${targetPath}`
    }
  } catch (error) {
    return {
      success: false,
      message: `文件复制失败: ${(error as Error).message}`
    }
  }
}
