# Atualiza o site no GitHub Pages (inforwnet-flow)
# Uso: clique com botao direito -> Executar com PowerShell
# Ou no terminal: .\atualizar-site.ps1
# Com mensagem: .\atualizar-site.ps1 "Corrigi a tela de login"

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$siteUrl = "https://fabiojose8759-ui.github.io/inforwnet-flow/"

Write-Host ""
Write-Host "=== Atualizar site Inforwnet ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git nao encontrado. Instale: https://git-scm.com/download/win" -ForegroundColor Red
    Read-Host "Pressione Enter para fechar"
    exit 1
}

$msg = $args[0]
if (-not $msg) {
    $msg = Read-Host "Descreva a alteracao (ex: Corrigir login)"
}
$msg = $msg.Trim()
if (-not $msg) {
    Write-Host "Cancelado: informe uma descricao." -ForegroundColor Yellow
    Read-Host "Pressione Enter para fechar"
    exit 0
}

git add .
$status = git status --porcelain
if (-not $status) {
    Write-Host "Nada mudou nos arquivos. Nada para enviar." -ForegroundColor Yellow
    Write-Host "Site: $siteUrl"
    Read-Host "Pressione Enter para fechar"
    exit 0
}

$env:GIT_AUTHOR_NAME = "Fabio"
$env:GIT_COMMITTER_NAME = "Fabio"
$env:GIT_AUTHOR_EMAIL = "fabiojose8759-ui@users.noreply.github.com"
$env:GIT_COMMITTER_EMAIL = "fabiojose8759-ui@users.noreply.github.com"

git commit -m $msg
git push

Write-Host ""
Write-Host "Enviado com sucesso!" -ForegroundColor Green
Write-Host "Aguarde 1-3 minutos e abra:" -ForegroundColor Green
Write-Host $siteUrl
Write-Host ""
Read-Host "Pressione Enter para fechar"
