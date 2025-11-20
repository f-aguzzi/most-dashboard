# Sequential Setup Script
# Syncs dependencies and builds the project

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Project Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Sync FastAPI backend dependencies
Write-Host "[1/3] Syncing FastAPI backend dependencies..." -ForegroundColor Green
try {
    Push-Location "fastapi-backend"
    uv sync
    if ($LASTEXITCODE -ne 0) {
        throw "uv sync failed with exit code $LASTEXITCODE"
    }
    Write-Host "Success: FastAPI dependencies synced successfully" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "Error: Failed to sync FastAPI dependencies: $_" -ForegroundColor Red
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
    Write-Host "Success: React dependencies installed successfully" -ForegroundColor Blue
    Write-Host ""
}
catch {
    Write-Host "Error: Failed to install React dependencies: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# Step 3: Create .env file for React
Write-Host "[3/4] Creating .env file for React dashboard..." -ForegroundColor Magenta
try {
    Push-Location "react-dash"
    $envContent = "VITE_URL=http://localhost:8000"
    Set-Content -Path ".env" -Value $envContent -Encoding UTF8
    Write-Host "Success: .env file created with VITE_URL=http://localhost:8000" -ForegroundColor Magenta
    Write-Host ""
}
catch {
    Write-Host "Error: Failed to create .env file: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# Step 4: Build React application
Write-Host "[4/4] Building React dashboard..." -ForegroundColor Blue
try {
    Push-Location "react-dash"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "npm run build failed with exit code $LASTEXITCODE"
    }
    Write-Host "Success: React dashboard built successfully" -ForegroundColor Blue
    Write-Host ""
}
catch {
    Write-Host "Error: Failed to build React dashboard: $_" -ForegroundColor Red
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
Write-Host ""
Write-Host "All dependencies are synced and the project is built." -ForegroundColor Green
Write-Host "You can now run the services using the parallel launcher script." -ForegroundColor Yellow
Write-Host ""
