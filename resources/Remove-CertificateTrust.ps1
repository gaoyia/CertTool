<#
.SYNOPSIS
    ��֤��洢��ɾ��ָ����֤��

.DESCRIPTION
    �˽ű����ڴ������εĸ�֤��䷢�������м�֤��䷢�����洢��ɾ��ָ����֤�顣
    ɾ��������Ҫ�ṩ֤��ָ�ƣ����һ�Ҫ���û�ȷ�ϡ�

.PARAMETER Thumbprint
    ֤��ָ�ƣ����裩�����ھ�ȷƥ��Ҫɾ����֤��

.PARAMETER StoreLocation
    ֤��洢λ�ã���ѡֵΪ"CurrentUser"��"LocalMachine"��Ĭ��ֵ��

.PARAMETER StoreName
    ֤��洢���ƣ���ѡֵΪ"Root"�������εĸ�֤��䷢��������"CA"���м�֤��䷢��������Ĭ��ֵ��"Root"��

.PARAMETER Force
    ����ȷ����ʾ��ֱ��ɾ��֤�飨���ã�

.EXAMPLE
    .\Remove-CertificateTrust.ps1 -Thumbprint "A1B2C3D4E5F6..."
    �ӱ��ؼ�����������θ�֤��䷢�����洢��ɾ��ָ��ָ�Ƶ�֤�飨��Ҫ��ȷ�ϣ�

.EXAMPLE
    .\Remove-CertificateTrust.ps1 -Thumbprint "A1B2C3D4E5F6..." -StoreLocation CurrentUser -StoreName CA -Force
    �ӵ�ǰ�û����м�֤��䷢�����洢��ɾ��ָ��ָ�Ƶ�֤�飨��Ҫ��ȷ�ϣ�
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

# ������ԱȨ�ޣ�LocalMachine������Ҫ����ԱȨ�ޣ�
if ($StoreLocation -eq "LocalMachine" -and -not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "�������ؼ����֤��洢��Ҫ����ԱȨ�ޣ����Թ���Ա������д˽ű�"
    exit 1
}

try {
    # ��ȡָ��֤��
    $certPath = "Cert:\$StoreLocation\$StoreName\$Thumbprint"
    $cert = Get-ChildItem -Path $certPath -ErrorAction Stop

    # ��ʾ֤����Ϣ
    Write-Host "�ҵ�����֤��:" -ForegroundColor Yellow
    Write-Host "����: $($cert.Subject)"
    Write-Host "�䷢��: $($cert.Issuer)"
    Write-Host "ָ��: $($cert.Thumbprint)"
    Write-Host "��Ч��: $($cert.NotBefore) �� $($cert.NotAfter)"

    # ȷ��ɾ��
    if (-not $Force) {
        $confirmation = Read-Host "ȷ��Ҫ�� $StoreLocation\$StoreName �洢��ɾ����֤����(y/n)"
        if ($confirmation -ne 'y') {
            Write-Host "ɾ��������ȡ��" -ForegroundColor Yellow
            exit 0
        }
    }

    # ɾ��֤��
    Remove-Item -Path $certPath -Force -ErrorAction Stop
    Write-Host "֤���ѳɹ�ɾ��" -ForegroundColor Green
}
catch [System.Management.Automation.ItemNotFoundException] {
    Write-Error "δ�ҵ�ָ��Ϊ '$Thumbprint' ��֤��"
    exit 1
}
catch {
    Write-Error "ɾ��֤��ʱ����: $_"
    exit 1
}

# ���ÿ���̨����ΪUTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
