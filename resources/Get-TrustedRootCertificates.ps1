<#
.SYNOPSIS
    获取受信任的根证书信息

.DESCRIPTION
    此脚本用于获取当前用户或本地计算机(所有用户)受信任的根证书信息，包括主题、颁发者、指纹、有效期等。

.PARAMETER StoreLocation
    指定要检查的证书存储位置，可选值为 "CurrentUser" 或 "LocalMachine"。

.EXAMPLE
    -StoreLocation CurrentUser
    获取当前用户的受信任根证书信息

.EXAMPLE
    -StoreLocation LocalMachine
    获取本地计算机(所有用户)的受信任根证书信息
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("CurrentUser", "LocalMachine")]
    [string]$StoreLocation = "CurrentUser"
)

# 如果没有显式指定参数，显示帮助信息
if ($PSBoundParameters.Count -eq 0) {
    Get-Help $MyInvocation.MyCommand.Path -Detailed
    exit
}

# 获取指定位置的受信任根证书
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", $StoreLocation)
$store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadOnly)
$certificates = $store.Certificates
foreach ($cert in $certificates) {
    Write-Output "$($cert.Subject)"       # 主题
    Write-Output "$($cert.Issuer)"        # 颁发者
    Write-Output "$($cert.Thumbprint)"    # 指纹
    Write-Output "$($cert.NotAfter)"      # 有效期截止时间
    Write-Output "$($cert.NotBefore)"     # 有效期起始时间
    Write-Output "$($cert.SerialNumber)"  # 序列号
    Write-Output "----------"
}
$store.Close()

# 切换成utf8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001
