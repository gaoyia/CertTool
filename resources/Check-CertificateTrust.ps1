<#
.SYNOPSIS
    ���֤���Ƿ������ָ����֤��洢��

.DESCRIPTION
    �˽ű����ڼ��ָ��֤���Ƿ�����������εĸ�֤��䷢�������м�֤��䷢�����洢�С�
    ����ͨ��֤��ָ�ƻ�������в�ѯ��

.PARAMETER Thumbprint
    ֤��ָ�ƣ���ѡ�������ھ�ȷƥ��֤��

.PARAMETER Subject
    ֤�����⣨��ѡ��������ģ��ƥ��֤������

.PARAMETER StoreLocation
    ֤��洢λ�ã���ѡֵΪ"CurrentUser"��"LocalMachine"��Ĭ��ֵ��

.PARAMETER StoreName
    ֤��洢���ƣ���ѡֵΪ"Root"�������εĸ�֤��䷢��������"CA"���м�֤��䷢��������Ĭ��ֵ��"Root"��

.EXAMPLE
    .\Check-CertificateTrust.ps1 -Thumbprint "A1B2C3D4E5F6..."
    ���ָ��ָ�Ƶ�֤���Ƿ�����ڱ��ؼ�����������θ�֤��䷢�����洢��

.EXAMPLE
    .\Check-CertificateTrust.ps1 -Subject "CN=My Cert" -StoreLocation CurrentUser -StoreName CA
    ��鵱ǰ�û����м�֤��䷢�����洢���Ƿ�����������"My Cert"��֤��
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

# ��֤�����ṩ��һ����ѯ����
if (-not $Thumbprint -and -not $Subject) {
    Write-Error "�����ṩ-Thumbprint��-Subject����"
    exit 1
}

try {
    # ��ȡָ���洢�е�����֤��
    $certs = Get-ChildItem -Path "Cert:\$StoreLocation\$StoreName" -ErrorAction Stop

    # ���ݲ�������֤��
    if ($Thumbprint) {
        $certs = $certs | Where-Object { $_.Thumbprint -eq $Thumbprint }
    }
    elseif ($Subject) {
        $certs = $certs | Where-Object { $_.Subject -like "*$Subject*" }
    }

    if ($certs) {
        Write-Host "�ҵ�ƥ���֤��:" -ForegroundColor Green
        $certs | ForEach-Object {
            Write-Host "����: $($_.Subject)"
            Write-Host "�䷢��: $($_.Issuer)"
            Write-Host "ָ��: $($_.Thumbprint)"
            Write-Host "��Ч��: $($_.NotBefore) �� $($_.NotAfter)"
            Write-Host "----------"
        }
    }
    else {
        Write-Host "δ�ҵ�ƥ���֤��" -ForegroundColor Yellow
    }
}
catch {
    Write-Error "���֤��ʱ����: $_"
    exit 1
}

# ���ÿ���̨����ΪUTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
