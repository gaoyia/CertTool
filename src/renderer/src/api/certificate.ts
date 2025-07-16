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
  fileName?: string
  force?: boolean
}

/**
 * 证书数据接口
 */
export interface Certificate {
  id: string
  name: string
  subject: {
    commonName: string
    country: string
    state: string
    locality: string
    organization: string
    organizationUnit: string
  }
  altNames: string[]
  validFrom: string
  validTo: string
  serialNumber: string
  pem: {
    privateKey: string
    publicKey: string
    certificate: string
  }
}

/**
 * 创建证书结果接口
 */
export interface CreateCertResult {
  success: boolean
  message: string
  data?: {
    certObject: Certificate
    fileName: string
    saved: boolean
  }
}

/**
 * 创建证书
 * @param certInfo 证书信息
 * @returns 创建结果
 */
export const createCertificate = async (certInfo: CertificateInfo): Promise<CreateCertResult> => {
  return await window.electron.ipcRenderer.invoke('create-cert', certInfo)
}


export const getTrustedRootCertificates = async (): Promise<Certificate[]> => {
  return await window.electron.ipcRenderer.invoke('Get-TrustedRootCertificates', 'LocalMachine')
}
