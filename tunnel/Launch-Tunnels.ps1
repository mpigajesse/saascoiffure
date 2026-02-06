$CloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
$ScriptDir = $PSScriptRoot

function Get-TunnelUrl($LogFile) {
    while ($true) {
        if (Test-Path $LogFile) {
            $Content = Get-Content $LogFile | Out-String
            # Recherche une URL qui a au moins un tiret (typique des tunnels temporaires)
            # Et qui ne contient pas "api" ou "update"
            if ($Content -match 'https://(?!(api|update))[a-z0-9]+-[a-z0-9-]+\.trycloudflare\.com') {
                return $Matches[0]
            }
        }
        Start-Sleep -Seconds 1
    }
}

Write-Host "Démarrage des tunnels Cloudflare..." -ForegroundColor Cyan

# Tuer les processus cloudflared existants
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Nettoyer les anciens logs (chemin absolu)
$FrontLog = Join-Path $ScriptDir "front.log"
$BackLog = Join-Path $ScriptDir "back.log"
if (Test-Path $FrontLog) { Remove-Item $FrontLog -Force }
if (Test-Path $BackLog) { Remove-Item $BackLog -Force }

# Lancer les tunnels
Start-Process $CloudflaredPath -ArgumentList "tunnel", "--url", "http://localhost:8000" -NoNewWindow -RedirectStandardError $BackLog
Write-Host "Tunnel Backend lancé (Port 8000). En attente de l'URL..." -ForegroundColor Yellow

Start-Process $CloudflaredPath -ArgumentList "tunnel", "--url", "http://localhost:8080" -NoNewWindow -RedirectStandardError $FrontLog
Write-Host "Tunnel Frontend lancé (Port 8080). En attente de l'URL..." -ForegroundColor Yellow

$BackUrl = Get-TunnelUrl($BackLog)
Write-Host "URL Backend détectée : $BackUrl" -ForegroundColor Green

$FrontUrl = Get-TunnelUrl($FrontLog)
Write-Host "URL Frontend détectée : $FrontUrl" -ForegroundColor Green

Write-Host "Mise à jour des Workers Cloudflare..." -ForegroundColor Cyan

# Mise à jour Backend Worker (needs both Django URL and Frontend URL)
Set-Location (Join-Path $ScriptDir "backend-proxy")
$BackUrl | wrangler secret put TUNNEL_URL
$FrontUrl | wrangler secret put FRONTEND_TUNNEL_URL
wrangler deploy

# Mise à jour Frontend Worker (needs both Frontend URL and Django URL)
Set-Location (Join-Path $ScriptDir "frontend-proxy")
$FrontUrl | wrangler secret put TUNNEL_URL
$BackUrl | wrangler secret put DJANGO_TUNNEL_URL
wrangler deploy

Set-Location $ScriptDir

Write-Host "`n--------------------------------------------------" -ForegroundColor Cyan
Write-Host "Tunnels opérationnels !" -ForegroundColor Green
Write-Host "Frontend stable : https://tunnel-front-naoservices.workers.dev" -ForegroundColor White
Write-Host "Backend stable  : https://tunnel-back-naoservices.workers.dev" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
