<#
.SYNOPSIS
    从证书存储中删除指定的证书

.DESCRIPTION
    此脚本用于从受信任的根证书颁发机构或中间证书颁发机构存储中删除指定的证书。
    删除操作需要提供证书指纹，并且会要求用户确认。

.PARAMETER Thumbprint
    证书指纹（必需），用于精确匹配要删除的证书

.PARAMETER StoreLocation
    证书存储位置，可选值为"CurrentUser"或"LocalMachine"（默认值）

.PARAMETER StoreName
    证书存储名称，可选值为"Root"（受信任的根证书颁发机构）或"CA"（中间证书颁发机构）（默认值："Root"）

.PARAMETER Force
    跳过确认提示，直接删除证书（慎用）

.EXAMPLE
    .\Remove-CertificateTrust.ps1 -Thumbprint "A1B2C3D4E5F6..."
    从本地计算机的受信任根证书颁发机构存储中删除指定指纹的证书（会要求确认）

.EXAMPLE
    .\Remove-CertificateTrust.ps1 -Thumbprint "A1B2C3D4E5F6..." -StoreLocation CurrentUser -StoreName CA -Force
    从当前用户的中间证书颁发机构存储中删除指定指纹的证书（不要求确认）
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Thumbprint,

    [Parameter(Mandatory=$false)]
    [ValidateSet("CurrentUser", "LocalMachine")]
    [string]$StoreLocation = "LocalMachine",

    [Parameter(Mandatory=$false)]
    [ValidateSet("Root", "CA")]
    [string]$StoreName = "Root",

    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# 检查管理员权限（LocalMachine操作需要管理员权限）
if ($StoreLocation -eq "LocalMachine" -and -not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "操作本地计算机证书存储需要管理员权限，请以管理员身份运行此脚本"
    exit 1
}

try {
    # 获取指定证书
    $certPath = "Cert:\$StoreLocation\$StoreName\$Thumbprint"
    $cert = Get-ChildItem -Path $certPath -ErrorAction Stop

    # 显示证书信息
    Write-Host "找到以下证书:" -ForegroundColor Yellow
    Write-Host "主题: $($cert.Subject)"
    Write-Host "颁发者: $($cert.Issuer)"
    Write-Host "指纹: $($cert.Thumbprint)"
    Write-Host "有效期: $($cert.NotBefore) 至 $($cert.NotAfter)"

    # 确认删除
    if (-not $Force) {
        $confirmation = Read-Host "确认要从 $StoreLocation\$StoreName 存储中删除此证书吗？(y/n)"
        if ($confirmation -ne 'y') {
            Write-Host "删除操作已取消" -ForegroundColor Yellow
            exit 0
        }
    }

    # 删除证书
    Remove-Item -Path $certPath -Force -ErrorAction Stop
    Write-Host "证书已成功删除" -ForegroundColor Green
}
catch [System.Management.Automation.ItemNotFoundException] {
    Write-Error "未找到指纹为 '$Thumbprint' 的证书"
    exit 1
}
catch {
    Write-Error "删除证书时出错: $_"
    exit 1
}

# 设置控制台编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
