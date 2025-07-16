import { ipcMain, IpcMainInvokeEvent, app } from 'electron'
import forge from 'node-forge'
import { exec } from 'child_process'
import GetTrustedRootCertificates from '../../../../resources/Get-TrustedRootCertificates.ps1?asset&asarUnpack'
import { writeFile } from '../../utility/file'

// 证书创建处理程序
ipcMain.handle(
  'create-cert',
  async (
    _event: IpcMainInvokeEvent,
    certInfo: {
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
  ) => {
    // 设置默认值
    const {
      commonName,
      country = 'CN',
      state = 'Beijing',
      locality = 'Beijing',
      organization = 'My Company',
      organizationUnit = 'Dev',
      altNames = ['localhost'],
      validityDays = 365,
      keySize = 2048
    } = certInfo

    // 生成密钥对
    const keys = forge.pki.rsa.generateKeyPair(keySize)

    // 创建证书
    const cert = forge.pki.createCertificate()
    cert.publicKey = keys.publicKey
    cert.serialNumber = Date.now().toString(16) // 使用时间戳作为序列号
    cert.validity.notBefore = new Date()
    cert.validity.notAfter = new Date()
    cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + validityDays)

    // 设置证书主题（Subject）
    const attrs = [
      { name: 'commonName', value: commonName },
      { name: 'countryName', value: country },
      { shortName: 'ST', value: state },
      { name: 'localityName', value: locality },
      { name: 'organizationName', value: organization },
      { shortName: 'OU', value: organizationUnit }
    ]
    cert.setSubject(attrs)
    cert.setIssuer(attrs) // 自签名证书的颁发者是自身

    // 添加扩展（如 Subject Alternative Name）
    const altNameObjects = altNames.map((name) => ({ type: 2, value: name }))

    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'subjectAltName',
        altNames: altNameObjects
      }
    ])

    // 自签名
    cert.sign(keys.privateKey, forge.md.sha256.create())

    // 导出 PEM 格式
    const pem = {
      privateKey: forge.pki.privateKeyToPem(keys.privateKey),
      publicKey: forge.pki.publicKeyToPem(keys.publicKey),
      certificate: forge.pki.certificateToPem(cert)
    }

    // 创建证书对象
    const certObject = {
      id: Date.now().toString(),
      subject: {
        commonName,
        country,
        state,
        locality,
        organization,
        organizationUnit,
        altNames,
        serialNumber: cert.serialNumber
      },
      validFrom: cert.validity.notBefore.toISOString(),
      validTo: cert.validity.notAfter.toISOString(),
      pem
    }

    return certObject
  }
)

// 获取受信任的根证书处理程序
ipcMain.handle(
  'Get-TrustedRootCertificates',
  async (_event: IpcMainInvokeEvent, storeLocation: 'LocalMachine' | 'CurrentUser') => {
    return new Promise((resolve, reject) => {
      exec(
        `powershell.exe -ExecutionPolicy Bypass -File "${GetTrustedRootCertificates}" -StoreLocation ${storeLocation}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`执行错误: ${error}`)
            reject(new Error(`执行错误: ${error.message}`))
            return
          }
          if (stderr) {
            console.error(`PowerShell 错误: ${stderr}`)
            // 有些PowerShell命令会输出到stderr但仍然成功执行，所以这里只记录不拒绝
          }

          try {
            // 使用分隔符分割
            const certificates = stdout.split('----------')
            certificates.pop() // 移除最后一个空元素

            const data = certificates.map((certificate) => {
              const lines = certificate.split(/\r?\n/).filter((item) => item !== '')
              const subject = lines[0]
              const issuer = lines[1]
              const thumbprint = lines[2]
              const notAfter = lines[3]
              const notBefore = lines[4]
              const serialNumber = lines[5]
              return {
                subject,
                issuer,
                thumbprint,
                notAfter,
                notBefore,
                serialNumber
              }
            })
            resolve(data)
          } catch (parseError) {
            console.error('解析证书数据失败:', parseError)
            reject(new Error(`解析证书数据失败: ${(parseError as Error).message}`))
          }
        }
      )
    })
  }
)

ipcMain.handle(
  'gen-pkcs12',
  async (
    _event: IpcMainInvokeEvent,
    filePath: string,
    pfxPassword: string,
    privateKeyPem: string,
    certificatePem: string,
    subjectCN?: string
  ): Promise<void> => {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)

    console.log(certificatePem);
    const certificate = forge.pki.certificateFromPem(certificatePem)
    console.log(certificate);
    // 生成 PKCS#12 ASN.1 结构
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
      privateKey,
      [certificate], // 可以传入多个证书（如证书链）
      pfxPassword,
      {
        generateLocalKeyId: true, // 生成本地密钥 ID
        friendlyName: subjectCN // 设置友好名称
      }
    )

    // 转换为 DER 格式（二进制）
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes()
    await writeFile(filePath, p12Der)
  }
)
