import { ipcMain, IpcMainInvokeEvent } from 'electron'
import forge from 'node-forge'
// IPC test
ipcMain.handle('create-cert', (_event: IpcMainInvokeEvent, ...args: unknown[]) => {
  console.log(args)

  // 生成密钥对
  const keys = forge.pki.rsa.generateKeyPair(2048)

  // 创建证书
  const cert = forge.pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = '01'
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1) // 1年有效期

  // 设置证书主题（Subject）
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'CN' },
    { shortName: 'ST', value: 'Beijing' },
    { name: 'localityName', value: 'Beijing' },
    { name: 'organizationName', value: 'My Company' },
    { shortName: 'OU', value: 'Dev' }
  ]
  cert.setSubject(attrs)
  cert.setIssuer(attrs) // 自签名证书的颁发者是自身

  // 添加扩展（如 Subject Alternative Name）
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
      altNames: [
        { type: 2, value: 'localhost' } // DNS: localhost
      ]
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

  console.log(pem.certificate) // 自签名证书
  console.log(pem.privateKey) // 私钥
})
