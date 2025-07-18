import { CertificateCreateData, CertificateInfo, CreateCertResult } from '@dto/certificate'

/**
 * 创建证书
 * @param certInfo 证书信息
 * @returns 创建结果
 */
export const createCertificate = async (
  certInfo: CertificateCreateData
): Promise<CreateCertResult> => {
  return await window.electron.ipcRenderer.invoke('create-cert', certInfo)
}

export const getTrustedRootCertificates = async (
  location: 'LocalMachine' | 'CurrentUser' = 'LocalMachine'
): Promise<CertificateInfo[]> => {
  return await window.electron.ipcRenderer.invoke('Get-TrustedRootCertificates', location)
}

/**
 * 生成PKCS12格式的证书文件
 * @param password  <PASSWORD>
 * @param cert 证书
 * @param key 私钥
 * @param ca 根证书
 * @returns PKCS12格式的证书文件
 */
export const genPkcs12 = (
  filePath: string,
  pfxPassword: string,
  certificatePem: string,
  privateKeyPem: string,
  friendlyName?: string
): Promise<string> => {
  return window.electron.ipcRenderer.invoke(
    'gen-pkcs12',
    filePath,
    pfxPassword,
    certificatePem,
    privateKeyPem,
    friendlyName
  )
}

/**
 * 导入证书到信任存储
 */
export const importCertificateTrust = async (
  filePath: string,
  storeLocation: 'LocalMachine' | 'CurrentUser' = 'LocalMachine',
  storeName: 'Root' | 'CA' = 'Root'
): Promise<string> => {
  return await window.electron.ipcRenderer.invoke(
    'Import-CertificateTrust',
    filePath,
    storeLocation,
    storeName
  )
}

/**
 * 检查证书是否信任
 */
export const checkCertificateTrust = async (options: {
  thumbprint?: string
  subject?: string
  storeLocation?: 'LocalMachine' | 'CurrentUser'
  storeName?: 'Root' | 'CA'
}): Promise<CertificateInfo[]> => {
  return await window.electron.ipcRenderer.invoke('Check-CertificateTrust', options)
}

/**
 * 从信任存储删除证书
 */
export const removeCertificateTrust = async (
  thumbprint: string,
  storeLocation: 'LocalMachine' | 'CurrentUser' = 'LocalMachine',
  storeName: 'Root' | 'CA' = 'Root',
  force: boolean = false
): Promise<string> => {
  return await window.electron.ipcRenderer.invoke(
    'Remove-CertificateTrust',
    thumbprint,
    storeLocation,
    storeName,
    force
  )
}
