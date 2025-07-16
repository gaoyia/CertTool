<template>
  <div class="about">
    <h1>关于</h1>
    <p>这是一个用于创建和管理证书的 Electron 应用</p>

    <code>
      # 获取当前用户受信任的根证书 $store = New-Object
      System.Security.Cryptography.X509Certificates.X509Store("Root", "CurrentUser")
      $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadOnly) $certificates
      = $store.Certificates foreach ($cert in $certificates) { Write-Output "主题: $($cert.Subject)"
      Write-Output "颁发者: $($cert.Issuer)" Write-Output "指纹: $($cert.Thumbprint)" Write-Output
      "------------------------" } $store.Close() # 获取本地计算机（所有用户）受信任的根证书 $store
      = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
      $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadOnly) $certificates
      = $store.Certificates foreach ($cert in $certificates) { Write-Output "主题: $($cert.Subject)"
      Write-Output "颁发者: $($cert.Issuer)" Write-Output "指纹: $($cert.Thumbprint)" Write-Output
      "------------------------" } $store.Close()
    </code>
  </div>
</template>
