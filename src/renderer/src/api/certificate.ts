/**
 * 证书信息接口
 */
export interface CertificateInfo {
  commonName: string
  country?: string
  state?: string
  locality?: string
  organization?: string
  organizationUnit?: string
  altNames?: string[]
  validityDays?: number
  keySize?: number
}

/**
 * 证书数据接口
 */
export interface Certificate {
  subject: string
  issuer: string
  thumbprint: string
  notAfter: string
  notBefore: string
  serialNumber: string
}

/**
 * 创建证书结果接口
 */
export interface CreateCertResult {
  id: string
  subject: CertificateInfo
  pem: {
    certificate: string
    privateKey: string
    publicKey: string
  }
  validFrom: string
  validTo: string
}

/**
 * 创建证书
 * @param certInfo 证书信息
 * @returns 创建结果
 */
export const createCertificate = async (certInfo: CertificateInfo): Promise<CreateCertResult> => {
  return await window.electron.ipcRenderer.invoke('create-cert', certInfo)
}

export const getTrustedRootCertificates = async (
  location: 'LocalMachine' | 'CurrentUser' = 'LocalMachine'
): Promise<Certificate[]> => {
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
export const genPkcs12 = async (
  filePath: string,
  pfxPassword: string,
  certificatePem: string,
  privateKeyPem: string,
  subjectCN?: string
): Promise<string> => {
  return await window.electron.ipcRenderer.invoke(
    'gen-pkcs12',
    filePath,
    pfxPassword,
    certificatePem,
    privateKeyPem,
    subjectCN
  )
}
