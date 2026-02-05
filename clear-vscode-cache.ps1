# Script PowerShell pour vider le cache de VS Code
# Auteur: Assistant IA
# Date: $(Get-Date)
# Description: Nettoie tous les caches de VS Code pour résoudre les problèmes de performance et de types

param(
    [switch]$Force,
    [switch]$NoRestart,
    [switch]$Verbose
)

# Configuration
$VSCodeProcessName = "Code"
$WorkspacePath = Get-Location

# Couleurs pour la console
function Write-ColoredOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success { param([string]$Message) Write-ColoredOutput "✅ $Message" "Green" }
function Write-Warning { param([string]$Message) Write-ColoredOutput "⚠️  $Message" "Yellow" }
function Write-Error { param([string]$Message) Write-ColoredOutput "❌ $Message" "Red" }
function Write-Info { param([string]$Message) Write-ColoredOutput "ℹ️  $Message" "Cyan" }
function Write-Step { param([string]$Message) Write-ColoredOutput "🔄 $Message" "Blue" }

# Affichage du titre
Write-Host ""
Write-ColoredOutput "═══════════════════════════════════════" "Magenta"
Write-ColoredOutput "    VS CODE CACHE CLEANER v2.0" "Magenta"
Write-ColoredOutput "═══════════════════════════════════════" "Magenta"
Write-Host ""

# Vérification des permissions administrateur
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (!$isAdmin) {
    Write-Warning "Certaines opérations nécessitent des privilèges administrateur."
    Write-Info "Continuons avec les permissions utilisateur..."
}

# Dossiers de cache de VS Code
$CacheFolders = @{
    "Workspace Storage" = "$env:APPDATA\Code\User\workspaceStorage"
    "Extension Host Cache" = "$env:APPDATA\Code\User\CachedExtensions"
    "Logs" = "$env:APPDATA\Code\logs"
    "Shader Cache" = "$env:APPDATA\Code\GPUCache"
    "Service Worker Cache" = "$env:APPDATA\Code\Service Worker\CacheStorage"
    "Code Cache" = "$env:APPDATA\Code\Code Cache"
    "Cached Data" = "$env:APPDATA\Code\CachedData"
    "Crash Reports" = "$env:APPDATA\Code\CrashReports"
}

# Dossiers additionnels pour extensions spécifiques
$ExtensionCaches = @{
    "TypeScript Cache" = "$env:LOCALAPPDATA\Microsoft\TypeScript"
    "ESLint Cache" = "$env:APPDATA\Code\User\workspaceStorage\*\ms-vscode.vscode-eslint"
    "Prettier Cache" = "$env:APPDATA\Code\User\workspaceStorage\*\esbenp.prettier-vscode"
    "C++ Tools Cache" = "$env:LOCALAPPDATA\Microsoft\vscode-cpptools"
    "Python Cache" = "$env:APPDATA\Code\User\workspaceStorage\*\ms-python.python"
    "Node.js Cache" = "$env:APPDATA\npm-cache"
}

# Fonction pour fermer VS Code
function Close-VSCode {
    Write-Step "Fermeture de VS Code..."
    
    $processes = Get-Process -Name $VSCodeProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Info "Processus VS Code trouvés: $($processes.Count)"
        
        if (!$Force) {
            $response = Read-Host "Fermer VS Code maintenant? (O/n)"
            if ($response -eq "n" -or $response -eq "N") {
                Write-Warning "Opération annulée par l'utilisateur."
                return $false
            }
        }
        
        try {
            $processes | ForEach-Object { 
                $_.CloseMainWindow() | Out-Null
                Start-Sleep -Milliseconds 500
            }
            
            # Attente de la fermeture gracieuse
            $timeout = 10
            while ((Get-Process -Name $VSCodeProcessName -ErrorAction SilentlyContinue) -and $timeout -gt 0) {
                Write-Host "." -NoNewline -ForegroundColor Yellow
                Start-Sleep -Seconds 1
                $timeout--
            }
            
            # Force kill si nécessaire
            $remainingProcesses = Get-Process -Name $VSCodeProcessName -ErrorAction SilentlyContinue
            if ($remainingProcesses) {
                Write-Warning "Forçage de la fermeture..."
                $remainingProcesses | Stop-Process -Force
            }
            
            Write-Success "VS Code fermé avec succès"
            return $true
        }
        catch {
            Write-Error "Erreur lors de la fermeture: $($_.Exception.Message)"
            return $false
        }
    } else {
        Write-Info "VS Code n'est pas en cours d'exécution"
        return $true
    }
}

# Fonction pour nettoyer un dossier
function Clear-Folder {
    param(
        [string]$Path,
        [string]$Name
    )
    
    if (Test-Path $Path) {
        try {
            $items = Get-ChildItem $Path -Recurse -Force -ErrorAction SilentlyContinue
            $itemCount = ($items | Measure-Object).Count
            $size = ($items | Measure-Object -Property Length -Sum).Sum
            $sizeInMB = [math]::Round($size / 1MB, 2)
            
            if ($itemCount -gt 0) {
                Write-Step "Nettoyage: $Name ($itemCount éléments, $sizeInMB MB)"
                
                if ($Verbose) {
                    Write-Info "Contenu du dossier:"
                    $items | Select-Object -First 10 | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
                    if ($itemCount -gt 10) { Write-Host "  ... et $($itemCount - 10) autres éléments" -ForegroundColor Gray }
                }
                
                Remove-Item $Path -Recurse -Force -ErrorAction SilentlyContinue
                New-Item -Path $Path -ItemType Directory -Force | Out-Null
                Write-Success "✓ $Name nettoyé ($sizeInMB MB libérés)"
            } else {
                Write-Info "□ $Name (déjà vide)"
            }
        }
        catch {
            Write-Error "Erreur lors du nettoyage de $Name : $($_.Exception.Message)"
        }
    } else {
        Write-Info "□ $Name (dossier inexistant)"
    }
}

# Fonction pour nettoyer les caches avec wildcard
function Clear-WildcardFolders {
    param(
        [string]$Pattern,
        [string]$Name
    )
    
    $matchingFolders = Get-ChildItem -Path (Split-Path $Pattern) -Filter (Split-Path $Pattern -Leaf) -Recurse -Directory -ErrorAction SilentlyContinue
    
    if ($matchingFolders) {
        $totalSize = 0
        $totalCount = 0
        
        foreach ($folder in $matchingFolders) {
            $items = Get-ChildItem $folder.FullName -Recurse -Force -ErrorAction SilentlyContinue
            $size = ($items | Measure-Object -Property Length -Sum).Sum
            $totalSize += $size
            $totalCount += ($items | Measure-Object).Count
        }
        
        $sizeInMB = [math]::Round($totalSize / 1MB, 2)
        
        if ($totalCount -gt 0) {
            Write-Step "Nettoyage: $Name ($($matchingFolders.Count) dossiers, $totalCount éléments, $sizeInMB MB)"
            $matchingFolders | ForEach-Object { Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue }
            Write-Success "✓ $Name nettoyé ($sizeInMB MB libérés)"
        } else {
            Write-Info "□ $Name (déjà vide)"
        }
    } else {
        Write-Info "□ $Name (aucun dossier correspondant)"
    }
}

# Fonction principale de nettoyage
function Clear-VSCodeCache {
    Write-Step "Début du nettoyage du cache VS Code..."
    Write-Host ""
    
    $totalCleared = 0
    
    # Nettoyage des dossiers principaux
    Write-ColoredOutput "📁 CACHES PRINCIPAUX" "Yellow"
    Write-ColoredOutput "─────────────────────" "Yellow"
    foreach ($cache in $CacheFolders.GetEnumerator()) {
        Clear-Folder -Path $cache.Value -Name $cache.Key
    }
    
    Write-Host ""
    
    # Nettoyage des caches d'extensions
    Write-ColoredOutput "🔌 CACHES D'EXTENSIONS" "Yellow"
    Write-ColoredOutput "──────────────────────" "Yellow"
    foreach ($cache in $ExtensionCaches.GetEnumerator()) {
        if ($cache.Value -like "*`**") {
            Clear-WildcardFolders -Pattern $cache.Value -Name $cache.Key
        } else {
            Clear-Folder -Path $cache.Value -Name $cache.Key
        }
    }
    
    Write-Host ""
    
    # Nettoyage spécifique du workspace actuel
    Write-ColoredOutput "🏠 WORKSPACE ACTUEL" "Yellow"
    Write-ColoredOutput "───────────────────" "Yellow"
    
    $projectSpecificCaches = @(
        "node_modules\.cache",
        ".vscode\extensions",
        ".eslintcache",
        "tsconfig.tsbuildinfo",
        "dist",
        "build",
        ".next",
        ".nuxt"
    )
    
    foreach ($cache in $projectSpecificCaches) {
        $fullPath = Join-Path $WorkspacePath $cache
        if (Test-Path $fullPath) {
            Clear-Folder -Path $fullPath -Name "Projet: $cache"
        }
    }
    
    # Nettoyage du cache npm/yarn/pnpm global
    Write-ColoredOutput "📦 GESTIONNAIRES DE PAQUETS" "Yellow"
    Write-ColoredOutput "───────────────────────────" "Yellow"
    
    try {
        Write-Step "Nettoyage du cache npm..."
        & npm cache clean --force 2>$null
        Write-Success "✓ Cache npm nettoyé"
    } catch {
        Write-Info "□ npm non disponible ou déjà propre"
    }
    
    try {
        Write-Step "Nettoyage du cache yarn..."
        & yarn cache clean 2>$null
        Write-Success "✓ Cache yarn nettoyé"
    } catch {
        Write-Info "□ yarn non disponible ou déjà propre"
    }
    
    return $true
}

# Fonction pour redémarrer VS Code
function Restart-VSCode {
    if (!$NoRestart) {
        Write-Step "Redémarrage de VS Code..."
        
        $response = "O"
        if (!$Force) {
            $response = Read-Host "Redémarrer VS Code dans le workspace actuel? (O/n)"
        }
        
        if ($response -ne "n" -and $response -ne "N") {
            try {
                Start-Process "code" -ArgumentList "." -NoNewWindow
                Write-Success "VS Code redémarré avec succès"
            }
            catch {
                Write-Error "Erreur lors du redémarrage: $($_.Exception.Message)"
                Write-Info "Vous pouvez redémarrer VS Code manuellement avec: code ."
            }
        }
    }
}

# Fonction pour afficher les statistiques finales
function Show-Statistics {
    Write-Host ""
    Write-ColoredOutput "📊 RÉSUMÉ DU NETTOYAGE" "Green"
    Write-ColoredOutput "─────────────────────" "Green"
    
    $afterSize = 0
    foreach ($cache in $CacheFolders.Values) {
        if (Test-Path $cache) {
            $items = Get-ChildItem $cache -Recurse -Force -ErrorAction SilentlyContinue
            $afterSize += ($items | Measure-Object -Property Length -Sum).Sum
        }
    }
    
    $afterSizeInMB = [math]::Round($afterSize / 1MB, 2)
    
    Write-Success "Cache VS Code nettoyé avec succès!"
    Write-Info "Taille actuelle du cache: $afterSizeInMB MB"
    Write-Info "Workspace: $WorkspacePath"
    Write-Host ""
    
    Write-ColoredOutput "💡 CONSEILS POST-NETTOYAGE" "Cyan"
    Write-ColoredOutput "──────────────────────────" "Cyan"
    Write-Host "• Rechargez la fenêtre VS Code (Ctrl+Shift+P > 'Reload Window')" -ForegroundColor Gray
    Write-Host "• Reinstallez les extensions si nécessaire" -ForegroundColor Gray
    Write-Host "• Vérifiez les paramètres TypeScript si vous avez des erreurs" -ForegroundColor Gray
    Write-Host "• Redémarrez complètement VS Code en cas de problèmes persistants" -ForegroundColor Gray
}

# ═══════════════════════════════════════
# EXÉCUTION PRINCIPALE
# ═══════════════════════════════════════

try {
    # Étape 1: Fermeture de VS Code
    if (!(Close-VSCode)) {
        exit 1
    }
    
    # Attente pour s'assurer que tous les processus sont fermés
    Start-Sleep -Seconds 2
    
    # Étape 2: Nettoyage du cache
    if (Clear-VSCodeCache) {
        # Étape 3: Redémarrage (optionnel)
        Restart-VSCode
        
        # Étape 4: Statistiques finales
        Show-Statistics
    }
    
    Write-Host ""
    Write-Success "🎉 Nettoyage terminé avec succès!"
    
} catch {
    Write-Error "❌ Erreur critique: $($_.Exception.Message)"
    Write-Info "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}

# Pause pour voir les résultats
if (!$Force) {
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour fermer..."
}