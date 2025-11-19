# Sequential Setup Script
# Syncs dependencies and builds the project

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Project Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Sync FastAPI backend dependencies
Write-Host "[1/3] Syncing FastAPI backend dependencies..." -ForegroundColor Green
try {
    Push-Location "fastapi-backend"
    uv sync
    if ($LASTEXITCODE -ne 0) {
        throw "uv sync failed with exit code $LASTEXITCODE"
    }
    Write-Host "✓ FastAPI dependencies synced successfully`n" -ForegroundColor Green
}
catch {
    Write-Host "✗ Failed to sync FastAPI dependencies: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# Step 2: Install React dependencies
Write-Host "[2/3] Installing React dashboard dependencies..." -ForegroundColor Blue
try {
    Push-Location "react-dash"
    npm i
    if ($LASTEXITCODE -ne 0) {
        throw "npm i failed with exit code $LASTEXITCODE"
    }
    Write-Host "✓ React dependencies installed successfully`n" -ForegroundColor Blue
}
catch {
    Write-Host "✗ Failed to install React dependencies: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# Step 3: Build React application
Write-Host "[3/3] Building React dashboard..." -ForegroundColor Blue
try {
    Push-Location "react-dash"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "npm run build failed with exit code $LASTEXITCODE"
    }
    Write-Host "✓ React dashboard built successfully`n" -ForegroundColor Blue
}
catch {
    Write-Host "✗ Failed to build React dashboard: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# Success message
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nAll dependencies are synced and the project is built." -ForegroundColor Green
Write-Host "You can now run the services using the parallel launcher script.`n" -ForegroundColor Yellow
