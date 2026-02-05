# Script PowerShell simplifié pour nettoyer rapidement VS Code
# Usage: .\quick-clean-vscode.ps1

Write-Host "🚀 Nettoyage rapide de VS Code..." -ForegroundColor Cyan

# Fermer VS Code s'il est ouvert
$processes = Get-Process -Name "Code" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "⏹️  Fermeture de VS Code..." -ForegroundColor Yellow
    $processes | ForEach-Object { $_.CloseMainWindow() }
    Start-Sleep -Seconds 3
    
    # Force kill si nécessaire
    Get-Process -Name "Code" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

# Nettoyer les caches principaux
$caches = @(
    "$env:APPDATA\Code\User\workspaceStorage",
    "$env:APPDATA\Code\logs",
    "$env:APPDATA\Code\CachedExtensions",
    "$env:APPDATA\Code\GPUCache"
)

foreach ($cache in $caches) {
    if (Test-Path $cache) {
        Write-Host "🧹 Nettoyage: $(Split-Path $cache -Leaf)" -ForegroundColor Green
        Remove-Item $cache -Recurse -Force -ErrorAction SilentlyContinue
        New-Item -Path $cache -ItemType Directory -Force | Out-Null
    }
}

# Nettoyer npm cache
Write-Host "📦 Nettoyage npm cache..." -ForegroundColor Green
& npm cache clean --force 2>$null

Write-Host "✅ Nettoyage terminé! Redémarrage de VS Code..." -ForegroundColor Green

# Redémarrer VS Code
Start-Sleep -Seconds 1
Start-Process "code" -ArgumentList "." -NoNewWindow

Write-Host "🎉 Fait! VS Code est redémarré." -ForegroundColor Magenta