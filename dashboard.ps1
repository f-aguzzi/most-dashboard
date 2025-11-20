# Parallel Service Launcher
# Lancia FastAPI e React in parallelo

Write-Host "Avvio dei servizi..." -ForegroundColor Cyan

# Leggi la cartella locale
$currentDir = (Get-Location).Path

# Crea blocchi script per entrambi i servizi
$fastApiJob = {
    param($baseDir)
    Set-Location $baseDir
    Set-Location "fastapi-backend"
    Write-Host "[FastAPI] Avvio del server uvicorn..." -ForegroundColor Green
    uv run uvicorn app.main:app
}

$reactJob = {
    param($baseDir)
    Set-Location $baseDir
    Set-Location "react-dash"
    Write-Host "[React] Avvio della dashboard..." -ForegroundColor Blue
    npm run preview
}

# Avvia entrambi i servizi con la cartella corrente come argomento
$job1 = Start-Job -ScriptBlock $fastApiJob -ArgumentList $currentDir
$job2 = Start-Job -ScriptBlock $reactJob -ArgumentList $currentDir

Write-Host "`nServizi lanciati in background" -ForegroundColor Yellow
Write-Host "Job IDs: FastAPI=$($job1.Id), React=$($job2.Id)" -ForegroundColor Yellow
Write-Host "`nPremi Ctrl+C per fermare tutti i servizi e uscire`n" -ForegroundColor Cyan

# Funzione per mostrare l'output dei servizi
function Show-JobOutput {
    param($job, $prefix)
    $output = Receive-Job -Job $job
    if ($output) {
        $output | ForEach-Object {
            Write-Host "[$prefix] $_"
        }
    }
}

# Controlla i servizi e mostra l'output
try {
    while ($true) {
        # Controlla se i servizi sono ancora attivi
        $job1State = (Get-Job -Id $job1.Id).State
        $job2State = (Get-Job -Id $job2.Id).State

        # Mostra l'output di entrambi i servizi
        Show-JobOutput -job $job1 -prefix "FastAPI"
        Show-JobOutput -job $job2 -prefix "React"

        # Controlla se uno qualsiasi dei servizi è fallito
        if ($job1State -eq "Failed") {
            Write-Host "`n[ERROR] FastAPI è crashato!" -ForegroundColor Red
            Show-JobOutput -job $job1 -prefix "FastAPI-Error"
        }
        if ($job2State -eq "Failed") {
            Write-Host "`n[ERROR] La pagina React è crashata!" -ForegroundColor Red
            Show-JobOutput -job $job2 -prefix "React-Error"
        }

        # Esci se entrambi i servizi si sono fermati
        if ($job1State -ne "Running" -and $job2State -ne "Running") {
            Write-Host "`nEntrambi i servizi sono stati fermati." -ForegroundColor Red
            break
        }

        Start-Sleep -Milliseconds 500
    }
}
finally {
    # Cleanup: ferma tutti i lavori quando lo script si interrompe
    Write-Host "`n`nFermo i servizi..." -ForegroundColor Yellow
    Stop-Job -Job $job1, $job2 -ErrorAction SilentlyContinue
    Remove-Job -Job $job1, $job2 -Force -ErrorAction SilentlyContinue
    Write-Host "Servizi fermati. Arrivederci!" -ForegroundColor Green
}
