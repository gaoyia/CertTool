<#
.SYNOPSIS
    导入证书到受信任的证书存储

.DESCRIPTION
    此脚本用于将证书导入到指定的证书存储中，可以是受信任的根证书颁发机构或中间证书颁发机构存储。

.PARAMETER FilePath
    证书文件路径（必需），支持.cer、.crt或.p7b格式

.PARAMETER StoreLocation
    证书存储位置，可选值为"CurrentUser"或"LocalMachine"（默认值）

.PARAMETER StoreName
    证书存储名称，可选值为"Root"（受信任的根证书颁发机构）或"CA"（中间证书颁发机构）（默认值："Root"）

.EXAMPLE
    .\Import-CertificateTrust.ps1 -FilePath "C:\certs\mycert.cer"
    将mycert.cer导入到本地计算机的受信任根证书颁发机构存储

.EXAMPLE
    .\Import-CertificateTrust.ps1 -FilePath "C:\certs\intermediate.crt" -StoreLocation CurrentUser -StoreName CA
    将intermediate.crt导入到当前用户的中间证书颁发机构存储
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateScript({
        if (-not (Test-Path $_)) {
            throw "证书文件不存在: $_"
        }
        $true
    })]
    [string]$FilePath,

    [Parameter(Mandatory=$false)]
    [ValidateSet("CurrentUser", "LocalMachine")]
    [string]$StoreLocation = "LocalMachine",

    [Parameter(Mandatory=$false)]
    [ValidateSet("Root", "CA")]
    [string]$StoreName = "Root"
)

# 检查管理员权限（LocalMachine操作需要管理员权限）
if ($StoreLocation -eq "LocalMachine" -and -not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "操作本地计算机证书存储需要管理员权限，请以管理员身份运行此脚本"
    exit 1
}

try {
    # 导入证书
    $cert = Import-Certificate -FilePath $FilePath -CertStoreLocation "Cert:\$StoreLocation\$StoreName" -ErrorAction Stop

    Write-Host "证书已成功导入到 $StoreLocation\$StoreName 存储" -ForegroundColor Green
    Write-Host "主题: $($cert.Subject)"
    Write-Host "颁发者: $($cert.Issuer)"
    Write-Host "指纹: $($cert.Thumbprint)"
    Write-Host "有效期: $($cert.NotBefore) 至 $($cert.NotAfter)"
}
catch {
    Write-Error "导入证书时出错: $_"
    exit 1
}

# 设置控制台编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
