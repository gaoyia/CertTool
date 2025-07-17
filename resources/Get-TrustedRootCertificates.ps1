<#
.SYNOPSIS
    ��ȡ�����εĸ�֤����Ϣ

.DESCRIPTION
    �˽ű����ڻ�ȡ��ǰ�û��򱾵ؼ����(�����û�)�����εĸ�֤����Ϣ���������⡢�䷢�ߡ�ָ�ơ���Ч�ڵȡ�

.PARAMETER StoreLocation
    ָ��Ҫ����֤��洢λ�ã���ѡֵΪ "CurrentUser" �� "LocalMachine"��

.EXAMPLE
    -StoreLocation CurrentUser
    ��ȡ��ǰ�û��������θ�֤����Ϣ

.EXAMPLE
    -StoreLocation LocalMachine
    ��ȡ���ؼ����(�����û�)�������θ�֤����Ϣ
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("CurrentUser", "LocalMachine")]
    [string]$StoreLocation = "CurrentUser"
)

# ���û����ʽָ����������ʾ������Ϣ
if ($PSBoundParameters.Count -eq 0) {
    Get-Help $MyInvocation.MyCommand.Path -Detailed
    exit
}

# ��ȡָ��λ�õ������θ�֤��
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", $StoreLocation)
$store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadOnly)
$certificates = $store.Certificates
foreach ($cert in $certificates) {
    Write-Output "$($cert.Subject)"       # ����
    Write-Output "$($cert.Issuer)"        # �䷢��
    Write-Output "$($cert.Thumbprint)"    # ָ��
    Write-Output "$($cert.NotAfter)"      # ��Ч�ڽ�ֹʱ��
    Write-Output "$($cert.NotBefore)"     # ��Ч����ʼʱ��
    Write-Output "$($cert.SerialNumber)"  # ���к�
    Write-Output "----------"
}
$store.Close()

# �л���utf8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001
