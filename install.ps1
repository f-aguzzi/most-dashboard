# Sequential Setup Script
# Scarica i pacchetti e compila la dashboard

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Avvio l'installazione del progetto" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Sincronizzazione delle dipendenze di FastAPI
Write-Host "[1/4] Sincronizzazione delle dipendenze del backend FastAPI..." -ForegroundColor Green
try {
    Push-Location "fastapi-backend"
    uv sync
    if ($LASTEXITCODE -ne 0) {
        throw "uv sync è fallito con l'exit code $LASTEXITCODE"
    }
    Write-Host "Successo: dipendenze di FastAPI sincronizzate correttamente" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "Errore: fallita la sincronizzazione delle dipendenze di FastAPI: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# Step 2: Installa i pacchetti di React
Write-Host "[2/4] Installazione delle dipendenze della dashboard React..." -ForegroundColor Blue
try {
    Push-Location "react-dash"
    npm i
    if ($LASTEXITCODE -ne 0) {
        throw "npm install fallito con l'exit code $LASTEXITCODE"
    }
    Write-Host "Successo: dipendenze di React installate correttamente" -ForegroundColor Blue
    Write-Host ""
}
catch {
    Write-Host "Errore: fallita l'installazione delle dipendenze di React: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# Step 3: Crea file .env per React
Write-Host "[3/4] Creazione del file .env per React..." -ForegroundColor Magenta
try {
    Push-Location "react-dash"
    $envContent = "VITE_URL=http://localhost:8000"
    Set-Content -Path ".env" -Value $envContent -Encoding UTF8
    Write-Host "Successo: file .env creato con VITE_URL=http://localhost:8000" -ForegroundColor Magenta
    Write-Host ""
}
catch {
    Write-Host "Errore: creazione del file .env fallita: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# Step 4: compila l'applicazione React
Write-Host "[4/4] Compilazione della dashboard React..." -ForegroundColor Blue
try {
    Push-Location "react-dash"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "npm run build fallito con l'exit code $LASTEXITCODE"
    }
    Write-Host "Successo: dashboard React compilata correttamente" -ForegroundColor Blue
    Write-Host ""
}
catch {
    Write-Host "Errore: fallita la compilazione della dashboard React: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# Messaggio di successo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installazione completa!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tutte le dipendenze sono sincronizzate e il progetto e' compilato." -ForegroundColor Green
Write-Host "E' ora possibile utilizzare lo script per l'esecuzione della dashboard." -ForegroundColor Yellow
Write-Host ""
