import fs from 'fs/promises'
import { constants } from 'fs'
import path from 'path'

/**
 * 确保目录存在，如果不存在则创建
 * @param dirPath 目录路径
 */
export async function ensureDir(dirPath: string) {
  return await fs.mkdir(dirPath, { recursive: true })
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
  options: object = {}
) {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true });
  return await fs.writeFile(filePath, data, options);
}

/**
 * 读取文件
 * @param filePath 文件路径
 * @param options 读取选项
 */
export async function readFile(filePath: string, options) {
  return await fs.readFile(filePath, options)
}

/**
 * 删除文件
 * @param filePath 文件路径
 */
export async function deleteFile(filePath: string) {
  await fs.unlink(filePath)
}

/**
 * 复制文件
 * @param sourcePath 源文件路径
 * @param targetPath 目标文件路径
 * @param options 写入选项
 */
export async function copyFile(sourcePath: string, targetPath: string, force: boolean = false) {
  const options = force ? fs.constants.COPYFILE_FICLONE_FORCE : undefined
  await fs.copyFile(sourcePath, targetPath, options)
}
