import { CertificateCreateData } from '@dto/certificate'

/**
 * 解析证书DN字符串为CertificateCreateData对象
 * @param dnString DN格式的字符串，如 "CN=Example Corp, O=Example Organization, C=US"
 * @returns 解析后的CertificateCreateData对象
 */
export function parseDN(dnString: string): CertificateCreateData {
  const result: CertificateCreateData = {
    commonName: '',
    country: '',
    state: '',
    locality: '',
    organization: '',
    organizationUnit: ''
  }

  if (!dnString) return result

  // 分割键值对，处理值中可能包含逗号的情况
  const parts = dnString.split(/(?<!\\), */)

  parts.forEach((part) => {
    const [key, value] = part.split('=')
    switch (key.trim()) {
      case 'CN':
        result.commonName = value.trim()
        break
      case 'C':
        result.country = value.trim()
        break
      case 'ST':
        result.state = value.trim()
        break
      case 'L':
        result.locality = value.trim()
        break
      case 'O':
        result.organization = value.trim()
        break
      case 'OU':
        result.organizationUnit = value.trim()
        break
    }
  })

  return result
}
