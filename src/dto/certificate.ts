/**
 * 证书信息接口
 */
export interface CertificateCreateData {
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
export interface CertificateInfo {
  subject: string
  issuer: string
  thumbprint: string
  notAfter: string
  notBefore: string
  serialNumber: string
  parsedSubject: CertificateCreateData
  parsedIssuer: CertificateCreateData
}
export interface PemInfo {
  certificate: string
  privateKey: string
  publicKey: string
}
/**
 * 创建证书结果接口
 */
export interface CreateCertResult {
  id: string
  subject: CertificateCreateData
  pem: PemInfo
  certInfo: CertificateInfo
}
