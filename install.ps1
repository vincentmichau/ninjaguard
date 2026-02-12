# NightWatch - Installateur Automatique Windows 11
# Ce script installe tous les composants nécessaires

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NightWatch - Installation Automatique  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier les privilèges administrateur
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Ce script doit être exécuté en tant qu'administrateur" -ForegroundColor Red
    Write-Host "Faites un clic droit sur le script et sélectionnez 'Exécuter en tant qu'administrateur'" -ForegroundColor Yellow
    pause
    exit 1
}

# Créer le dossier d'installation
$installPath = "$env:PROGRAMFILES\NightWatch"
if (!(Test-Path $installPath)) {
    Write-Host "📁 Création du dossier d'installation..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $installPath -Force | Out-Null
}

# Copier les fichiers
Write-Host "📋 Copie des fichiers..." -ForegroundColor Yellow
Copy-Item -Path ".\*" -Destination $installPath -Recurse -Force

# Vérifier Node.js
Write-Host ""
Write-Host "🔍 Vérification de Node.js..." -ForegroundColor Yellow
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue

if (!$nodeInstalled) {
    Write-Host "⬇️  Installation de Node.js..." -ForegroundColor Yellow
    $nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
    $nodeMsi = "$env:TEMP\node-installer.msi"
    
    Write-Host "Téléchargement de Node.js..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeMsi -UseBasicParsing
    
    Write-Host "Installation de Node.js..." -ForegroundColor Gray
    Start-Process msiexec.exe -ArgumentList "/i $nodeMsi /quiet /norestart" -Wait
    
    Remove-Item $nodeMsi
    Write-Host "✅ Node.js installé avec succès" -ForegroundColor Green
    
    # Rafraîchir les variables d'environnement
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    $nodeVersion = node --version
    Write-Host "✅ Node.js est déjà installé (version $nodeVersion)" -ForegroundColor Green
}

# Vérifier MySQL
Write-Host ""
Write-Host "🔍 Vérification de MySQL..." -ForegroundColor Yellow
$mysqlInstalled = Get-Command mysql -ErrorAction SilentlyContinue

if (!$mysqlInstalled) {
    Write-Host "⚠️  MySQL n'est pas installé" -ForegroundColor Yellow
    Write-Host "Veuillez installer MySQL 8.0+ depuis: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Red
    Write-Host "Ou utilisez XAMPP qui inclut MySQL: https://www.apachefriends.org/" -ForegroundColor Red
    
    $continue = Read-Host "Continuer l'installation sans MySQL? (O/N)"
    if ($continue -ne "O" -and $continue -ne "o") {
        exit 1
    }
} else {
    Write-Host "✅ MySQL est installé" -ForegroundColor Green
}

# Installer les dépendances Backend
Write-Host ""
Write-Host "📦 Installation des dépendances Backend..." -ForegroundColor Yellow
Set-Location "$installPath\backend"
npm install --silent

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances Backend" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✅ Dépendances Backend installées" -ForegroundColor Green

# Installer les dépendances Frontend
Write-Host ""
Write-Host "📦 Installation des dépendances Frontend..." -ForegroundColor Yellow
Set-Location "$installPath\frontend"
npm install --silent

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances Frontend" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✅ Dépendances Frontend installées" -ForegroundColor Green

# Configuration de l'environnement
Write-Host ""
Write-Host "⚙️  Configuration de l'environnement..." -ForegroundColor Yellow

$envFile = "$installPath\backend\.env"

if (!(Test-Path $envFile)) {
    Write-Host "Création du fichier .env..." -ForegroundColor Gray
    
    # Générer des clés sécurisées
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
    $encryptionKey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
    
    $envContent = @"
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=nightwatch_db
DB_PORT=3306

# JWT
JWT_SECRET=$jwtSecret
JWT_EXPIRE=24h

# SMTP (Emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Serveur
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:5173

# API RH (Optionnel)
RH_API_KEY=
RH_API_URL=https://api.combo.fr

# Uploads
UPLOAD_DIR=./uploads

# Cryptage
ENCRYPTION_KEY=$encryptionKey
"@
    
    Set-Content -Path $envFile -Value $envContent
    Write-Host "✅ Fichier .env créé" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Veuillez éditer $envFile et configurer vos paramètres" -ForegroundColor Yellow
} else {
    Write-Host "✅ Fichier .env déjà existant" -ForegroundColor Green
}

# Configuration de la base de données
Write-Host ""
Write-Host "🗄️  Configuration de la base de données..." -ForegroundColor Yellow
Write-Host "Veuillez créer la base de données MySQL:" -ForegroundColor Yellow
Write-Host "1. Ouvrez MySQL Workbench ou phpMyAdmin" -ForegroundColor White
Write-Host "2. Exécutez le script: $installPath\backend\database\schema.sql" -ForegroundColor White

$createDb = Read-Host "Créer la base de données maintenant? (O/N)"
if ($createDb -eq "O" -or $createDb -eq "o") {
    $dbUser = Read-Host "Nom d'utilisateur MySQL (root)"
    $dbPassword = Read-Host "Mot de passe MySQL"
    
    if ($dbPassword) {
        $mysqlCmd = "mysql -u $dbUser -p$dbPassword < `"$installPath\backend\database\schema.sql`""
    } else {
        $mysqlCmd = "mysql -u $dbUser < `"$installPath\backend\database\schema.sql`""
    }
    
    try {
        Invoke-Expression $mysqlCmd
        Write-Host "✅ Base de données créée avec succès" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de la création de la base de données" -ForegroundColor Red
        Write-Host "Exécutez manuellement: mysql -u root -p < schema.sql" -ForegroundColor Yellow
    }
}

# Créer les raccourcis
Write-Host ""
Write-Host "🔗 Création des raccourcis..." -ForegroundColor Yellow

$desktopPath = [Environment]::GetFolderPath("Desktop")
$startMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"

# Raccourci Backend
$backendShortcutPath = "$desktopPath\NightWatch Backend.lnk"
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($backendShortcutPath)
$Shortcut.TargetPath = "node.exe"
$Shortcut.Arguments = "`"$installPath\backend\server.js`""
$Shortcut.WorkingDirectory = "$installPath\backend"
$Shortcut.IconLocation = "$installPath\backend\server.js"
$Shortcut.Description = "NightWatch Backend Server"
$Shortcut.Save()

# Raccourci Frontend
$frontendShortcutPath = "$desktopPath\NightWatch Frontend.lnk"
$Shortcut = $WshShell.CreateShortcut($frontendShortcutPath)
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/c cd `"$installPath\frontend`" && npm run dev && pause"
$Shortcut.WorkingDirectory = "$installPath\frontend"
$Shortcut.IconLocation = "$installPath\frontend\index.html"
$Shortcut.Description = "NightWatch Frontend"
$Shortcut.Save()

Write-Host "✅ Raccourcis créés sur le bureau" -ForegroundColor Green

# Créer le service Windows (optionnel)
Write-Host ""
$createService = Read-Host "Créer un service Windows pour le Backend? (O/N)"
if ($createService -eq "O" -or $createService -eq "o") {
    Write-Host "⚙️  Création du service Windows..." -ForegroundColor Yellow
    
    $serviceName = "NightWatchBackend"
    $serviceDisplayName = "NightWatch Backend Service"
    $serviceBinary = "node.exe"
    $serviceArgs = "`"$installPath\backend\server.js`""
    
    # Utiliser NSSM pour créer le service
    $nssmPath = "$installPath\nssm.exe"
    if (!(Test-Path $nssmPath)) {
        Write-Host "Téléchargement de NSSM..." -ForegroundColor Gray
        Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" -OutFile "$env:TEMP\nssm.zip"
        Expand-Archive -Path "$env:TEMP\nssm.zip" -DestinationPath "$env:TEMP\nssm" -Force
        Copy-Item "$env:TEMP\nssm\nssm-2.24\win64\nssm.exe" -Destination $nssmPath
        Remove-Item "$env:TEMP\nssm.zip" -Force
        Remove-Item "$env:TEMP\nssm" -Recurse -Force
    }
    
    # Créer le service
    Start-Process $nssmPath -ArgumentList "install $serviceName $serviceBinary $serviceArgs" -Wait
    Start-Process $nssmPath -ArgumentList "set $serviceName AppDirectory `"$installPath\backend`"" -Wait
    Start-Process $nssmPath -ArgumentList "set $serviceName DisplayName $serviceDisplayName" -Wait
    Start-Process $nssmPath -ArgumentList "set $serviceName Description NightWatch Backend Server" -Wait
    Start-Process $nssmPath -ArgumentList "set $serviceName Start SERVICE_AUTO_START" -Wait
    
    Write-Host "✅ Service Windows créé" -ForegroundColor Green
    Write-Host "Commandes utiles:" -ForegroundColor Yellow
    Write-Host "  Démarrer: nssm start $serviceName" -ForegroundColor White
    Write-Host "  Arrêter: nssm stop $serviceName" -ForegroundColor White
    Write-Host "  Redémarrer: nssm restart $serviceName" -ForegroundColor White
}

# Résumé de l'installation
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Terminée! 🎉           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 Dossier d'installation: $installPath" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Étapes finales:" -ForegroundColor Yellow
Write-Host "1. Configurez le fichier: $envFile" -ForegroundColor White
Write-Host "2. Configurez la base de données MySQL" -ForegroundColor White
Write-Host "3. Démarrez le Backend: Double-cliquez sur 'NightWatch Backend.lnk'" -ForegroundColor White
Write-Host "4. Démarrez le Frontend: Double-cliquez sur 'NightWatch Frontend.lnk'" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Accès à l'application:" -ForegroundColor Yellow
Write-Host "   URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Admin: admin@nightwatch.fr" -ForegroundColor Cyan
Write-Host "   Mot de passe: Admin123!" -ForegroundColor Cyan
Write-Host "   ⚠️  CHANGEZ LE MOT DE PASSE ADMIN!" -ForegroundColor Red
Write-Host ""
Write-Host "📚 Documentation: $installPath\README.md" -ForegroundColor White
Write-Host ""

pause