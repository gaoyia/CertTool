<#
.SYNOPSIS
    ����֤�鵽�����ε�֤��洢

.DESCRIPTION
    �˽ű����ڽ�֤�鵼�뵽ָ����֤��洢�У������������εĸ�֤��䷢�������м�֤��䷢�����洢��

.PARAMETER FilePath
    ֤���ļ�·�������裩��֧��.cer��.crt��.p7b��ʽ

.PARAMETER StoreLocation
    ֤��洢λ�ã���ѡֵΪ"CurrentUser"��"LocalMachine"��Ĭ��ֵ��

.PARAMETER StoreName
    ֤��洢���ƣ���ѡֵΪ"Root"�������εĸ�֤��䷢��������"CA"���м�֤��䷢��������Ĭ��ֵ��"Root"��

.EXAMPLE
    .\Import-CertificateTrust.ps1 -FilePath "C:\certs\mycert.cer"
    ��mycert.cer���뵽���ؼ�����������θ�֤��䷢�����洢

.EXAMPLE
    .\Import-CertificateTrust.ps1 -FilePath "C:\certs\intermediate.crt" -StoreLocation CurrentUser -StoreName CA
    ��intermediate.crt���뵽��ǰ�û����м�֤��䷢�����洢
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateScript({
        if (-not (Test-Path $_)) {
            throw "֤���ļ�������: $_"
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

# ������ԱȨ�ޣ�LocalMachine������Ҫ����ԱȨ�ޣ�
if ($StoreLocation -eq "LocalMachine" -and -not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "�������ؼ����֤��洢��Ҫ����ԱȨ�ޣ����Թ���Ա������д˽ű�"
    exit 1
}

try {
    # ����֤��
    $cert = Import-Certificate -FilePath $FilePath -CertStoreLocation "Cert:\$StoreLocation\$StoreName" -ErrorAction Stop

    Write-Host "֤���ѳɹ����뵽 $StoreLocation\$StoreName �洢" -ForegroundColor Green
    Write-Host "����: $($cert.Subject)"
    Write-Host "�䷢��: $($cert.Issuer)"
    Write-Host "ָ��: $($cert.Thumbprint)"
    Write-Host "��Ч��: $($cert.NotBefore) �� $($cert.NotAfter)"
}
catch {
    Write-Error "����֤��ʱ����: $_"
    exit 1
}

# ���ÿ���̨����ΪUTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
