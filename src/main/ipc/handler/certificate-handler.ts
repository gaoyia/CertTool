import { ipcMain, IpcMainInvokeEvent } from 'electron'
import forge from 'node-forge'
import { exec, spawn } from 'child_process'
import GetTrustedRootCertificates from '../../../../resources/Get-TrustedRootCertificates.ps1?asset&asarUnpack'
import ImportCertificateTrust from '../../../../resources/Import-CertificateTrust.ps1?asset&asarUnpack'
import CheckCertificateTrust from '../../../../resources/Check-CertificateTrust.ps1?asset&asarUnpack'
import RemoveCertificateTrust from '../../../../resources/Remove-CertificateTrust.ps1?asset&asarUnpack'
import { writeFile } from '../../utility/file'
import { parseDN } from '../../utility/certificate'
import { CertificateCreateData, CreateCertResult } from '@dto/certificate'

// 证书创建处理程序
ipcMain.handle(
  'create-cert',
  async (_event: IpcMainInvokeEvent, certInfo: CertificateCreateData) => {
    // 设置默认值
    const {
      commonName,
      country,
      state,
      locality,
      organization,
      organizationUnit,
      altNames = [],
      validityDays,
      keySize
    } = certInfo

    // 生成密钥对
    const keys = forge.pki.rsa.generateKeyPair(keySize)

    // 创建证书
    const cert = forge.pki.createCertificate()
    cert.publicKey = keys.publicKey
    cert.serialNumber = Date.now().toString(16)
    cert.validity.notBefore = new Date()
    cert.validity.notAfter = new Date()
    cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + validityDays)

    // 设置证书主题
    const attrs = [
      { name: 'commonName', value: commonName },
      { name: 'countryName', value: country },
      { shortName: 'ST', value: state },
      { name: 'localityName', value: locality },
      { name: 'organizationName', value: organization },
      { shortName: 'OU', value: organizationUnit }
    ]

    cert.setSubject(attrs)
    cert.setIssuer(attrs)

    // 添加扩展
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

    // 导出PEM格式
    const pem = {
      privateKey: forge.pki.privateKeyToPem(keys.privateKey),
      publicKey: forge.pki.publicKeyToPem(keys.publicKey),
      certificate: forge.pki.certificateToPem(cert)
    }

    // 创建证书对象
    const certObject: CreateCertResult = {
      id: Date.now().toString(),
      subject: {
        commonName,
        country,
        state,
        locality,
        organization,
        organizationUnit,
        altNames
      },
      pem,
      certInfo: {
        subject: cert.subject.attributes.map((attr) => `${attr.name}=${attr.value}`).join(','),
        issuer: cert.issuer.attributes.map((attr) => `${attr.name}=${attr.value}`).join(','),
        thumbprint: forge.md.sha1
          .create()
          .update(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes())
          .digest()
          .toHex(),
        notAfter: cert.validity.notAfter.toISOString(),
        notBefore: cert.validity.notBefore.toISOString(),
        serialNumber: cert.serialNumber,
        parsedSubject: {
          commonName,
          country,
          state,
          locality,
          organization,
          organizationUnit,
          altNames
        },
        parsedIssuer: {
          commonName,
          country,
          state,
          locality,
          organization,
          organizationUnit,
          altNames
        }
      }
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
          }

          try {
            const certificates = stdout.split('----------')
            certificates.pop()

            const data = certificates.map((certificate) => {
              const lines = certificate.split(/\r?\n/).filter((item) => item !== '')
              return {
                subject: lines[0],
                issuer: lines[1],
                thumbprint: lines[2],
                notAfter: lines[3],
                notBefore: lines[4],
                serialNumber: lines[5],
                parsedSubject: parseDN(lines[0]),
                parsedIssuer: parseDN(lines[1])
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

// 导入证书到信任存储处理程序
ipcMain.handle(
  'Import-CertificateTrust',
  async (_event, filePath, storeLocation = 'LocalMachine', storeName = 'Root') => {
    return new Promise((resolve, reject) => {
      // 关键：通过 Start-Process 触发 UAC
      const psScript = `Start-Process powershell.exe \
-ArgumentList '-NoLogo -NoProfile -ExecutionPolicy Bypass -File "${ImportCertificateTrust}" \
-FilePath "${filePath}" \
-StoreLocation ${storeLocation} \
-StoreName ${storeName}' \
${storeLocation === 'LocalMachine' ? '-Verb RunAs' : ''} \
-WindowStyle Hidden \
-Wait`
      const psProcess = spawn('powershell.exe', ['-Command', psScript], { stdio: 'pipe' })

      let stdout = '',
        stderr = ''
      psProcess.stdout.on('data', (data) => (stdout += data))
      psProcess.stderr.on('data', (data) => (stderr += data))

      psProcess.on('close', (code) => {
        if (code !== 0) reject(new Error(stderr || `退出码 ${code}`))
        else resolve(stdout)
      })

      psProcess.on('error', reject)
    })
  }
)

// 检查证书是否信任处理程序
ipcMain.handle(
  'Check-CertificateTrust',
  async (
    _event: IpcMainInvokeEvent,
    options: {
      thumbprint?: string
      subject?: string
      storeLocation?: 'LocalMachine' | 'CurrentUser'
      storeName?: 'Root' | 'CA'
    }
  ) => {
    const { thumbprint, subject, storeLocation = 'LocalMachine', storeName = 'Root' } = options

    return new Promise((resolve, reject) => {
      let command = `powershell.exe -ExecutionPolicy Bypass -File "${CheckCertificateTrust}" -StoreLocation ${storeLocation} -StoreName ${storeName}`

      if (thumbprint) {
        command += ` -Thumbprint "${thumbprint}"`
      } else if (subject) {
        command += ` -Subject "${subject}"`
      }

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`执行错误: ${error}`)
          reject(new Error(`执行错误: ${error.message}`))
          return
        }
        if (stderr) {
          console.error(`PowerShell 错误: ${stderr}`)
        }

        try {
          const certificates = stdout.split('----------')
          certificates.pop()

          const data = certificates.map((certificate) => {
            const lines = certificate.split(/\r?\n/).filter((item) => item !== '')
            return {
              subject: lines[0],
              issuer: lines[1],
              thumbprint: lines[2],
              notAfter: lines[3],
              notBefore: lines[4],
              serialNumber: lines[5]
            }
          })
          resolve(data)
        } catch (parseError) {
          console.error('解析证书数据失败:', parseError)
          reject(new Error(`解析证书数据失败: ${(parseError as Error).message}`))
        }
      })
    })
  }
)

// 从信任存储删除证书处理程序
ipcMain.handle(
  'Remove-CertificateTrust',
  async (
    _event: IpcMainInvokeEvent,
    thumbprint: string,
    storeLocation: 'LocalMachine' | 'CurrentUser' = 'LocalMachine',
    storeName: 'Root' | 'CA' = 'Root',
    force: boolean = false
  ) => {
    return new Promise((resolve, reject) => {
      // 构建PowerShell命令参数
      let psArgs = `-NoLogo -NoProfile -ExecutionPolicy Bypass -File "${RemoveCertificateTrust}" -Thumbprint "${thumbprint}" -StoreLocation ${storeLocation} -StoreName ${storeName}`

      if (force) {
        psArgs += ' -Force'
      }

      // 关键：通过 Start-Process 触发 UAC
      const psScript = `Start-Process powershell.exe \
      -ArgumentList '${psArgs}' \
      ${storeLocation === 'LocalMachine' ? '-Verb RunAs' : ''} \
      -WindowStyle Hidden \
      -Wait`
      const psProcess = spawn('powershell.exe', ['-Command', psScript], { stdio: 'pipe' })

      let stdout = '',
        stderr = ''
      psProcess.stdout.on('data', (data) => (stdout += data))
      psProcess.stderr.on('data', (data) => (stderr += data))

      psProcess.on('close', (code) => {
        if (code !== 0) reject(new Error(stderr || `退出码 ${code}`))
        else resolve(stdout)
      })

      psProcess.on('error', reject)
    })
  }
)

// 生成PKCS12证书处理程序
ipcMain.handle(
  'gen-pkcs12',
  async (
    _event: IpcMainInvokeEvent,
    filePath: string,
    password: string,
    privateKeyPem: string,
    certificatePem: string,
    friendlyName?: string
  ): Promise<void> => {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
    const certificate = forge.pki.certificateFromPem(certificatePem)
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKey, [certificate], password, {
      generateLocalKeyId: true,
      friendlyName: friendlyName
    })
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes()
    await writeFile(filePath, Buffer.from(p12Der, 'binary'))
  }
)
