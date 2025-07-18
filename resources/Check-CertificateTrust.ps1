<#
.SYNOPSIS
    检查证书是否存在于指定的证书存储中

.DESCRIPTION
    此脚本用于检查指定证书是否存在于受信任的根证书颁发机构或中间证书颁发机构存储中。
    可以通过证书指纹或主题进行查询。

.PARAMETER Thumbprint
    证书指纹（可选），用于精确匹配证书

.PARAMETER Subject
    证书主题（可选），用于模糊匹配证书主题

.PARAMETER StoreLocation
    证书存储位置，可选值为"CurrentUser"或"LocalMachine"（默认值）

.PARAMETER StoreName
    证书存储名称，可选值为"Root"（受信任的根证书颁发机构）或"CA"（中间证书颁发机构）（默认值："Root"）

.EXAMPLE
    .\Check-CertificateTrust.ps1 -Thumbprint "A1B2C3D4E5F6..."
    检查指定指纹的证书是否存在于本地计算机的受信任根证书颁发机构存储中

.EXAMPLE
    .\Check-CertificateTrust.ps1 -Subject "CN=My Cert" -StoreLocation CurrentUser -StoreName CA
    检查当前用户的中间证书颁发机构存储中是否存在主题包含"My Cert"的证书
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Thumbprint,

    [Parameter(Mandatory=$false)]
    [string]$Subject,

    [Parameter(Mandatory=$false)]
    [ValidateSet("CurrentUser", "LocalMachine")]
    [string]$StoreLocation = "LocalMachine",

    [Parameter(Mandatory=$false)]
    [ValidateSet("Root", "CA")]
    [string]$StoreName = "Root"
)

# 验证至少提供了一个查询条件
if (-not $Thumbprint -and -not $Subject) {
    Write-Error "必须提供-Thumbprint或-Subject参数"
    exit 1
}

try {
    # 获取指定存储中的所有证书
    $certs = Get-ChildItem -Path "Cert:\$StoreLocation\$StoreName" -ErrorAction Stop

    # 根据参数过滤证书
    if ($Thumbprint) {
        $certs = $certs | Where-Object { $_.Thumbprint -eq $Thumbprint }
    }
    elseif ($Subject) {
        $certs = $certs | Where-Object { $_.Subject -like "*$Subject*" }
    }

    if ($certs) {
        Write-Host "找到匹配的证书:" -ForegroundColor Green
        $certs | ForEach-Object {
            Write-Host "主题: $($_.Subject)"
            Write-Host "颁发者: $($_.Issuer)"
            Write-Host "指纹: $($_.Thumbprint)"
            Write-Host "有效期: $($_.NotBefore) 至 $($_.NotAfter)"
            Write-Host "----------"
        }
    }
    else {
        Write-Host "未找到匹配的证书" -ForegroundColor Yellow
    }
}
catch {
    Write-Error "检查证书时出错: $_"
    exit 1
}

# 设置控制台编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
