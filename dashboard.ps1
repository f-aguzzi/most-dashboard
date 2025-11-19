# Parallel Service Launcher
# Launches FastAPI backend and React dashboard simultaneously

Write-Host "Starting services..." -ForegroundColor Cyan

# Create script blocks for each service
$fastApiJob = {
    Set-Location "fastapi-backend"
    Write-Host "[FastAPI] Starting uvicorn server..." -ForegroundColor Green
    uv run uvicorn app.main:app
}

$reactJob = {
    Set-Location "react-dash"
    Write-Host "[React] Starting preview server..." -ForegroundColor Blue
    npm run preview
}

# Start both jobs
$job1 = Start-Job -ScriptBlock $fastApiJob
$job2 = Start-Job -ScriptBlock $reactJob

Write-Host "`nServices launched in background jobs" -ForegroundColor Yellow
Write-Host "Job IDs: FastAPI=$($job1.Id), React=$($job2.Id)" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C to stop all services and exit`n" -ForegroundColor Cyan

# Function to display job output
function Show-JobOutput {
    param($job, $prefix)
    $output = Receive-Job -Job $job
    if ($output) {
        $output | ForEach-Object {
            Write-Host "[$prefix] $_"
        }
    }
}

# Monitor jobs and display output
try {
    while ($true) {
        # Check if jobs are still running
        $job1State = (Get-Job -Id $job1.Id).State
        $job2State = (Get-Job -Id $job2.Id).State

        # Display output from both jobs
        Show-JobOutput -job $job1 -prefix "FastAPI"
        Show-JobOutput -job $job2 -prefix "React"

        # Check if any job has failed
        if ($job1State -eq "Failed") {
            Write-Host "`n[ERROR] FastAPI job failed!" -ForegroundColor Red
            Show-JobOutput -job $job1 -prefix "FastAPI-Error"
        }
        if ($job2State -eq "Failed") {
            Write-Host "`n[ERROR] React job failed!" -ForegroundColor Red
            Show-JobOutput -job $job2 -prefix "React-Error"
        }

        # Exit if both jobs have stopped
        if ($job1State -ne "Running" -and $job2State -ne "Running") {
            Write-Host "`nBoth services have stopped." -ForegroundColor Red
            break
        }

        Start-Sleep -Milliseconds 500
    }
}
finally {
    # Cleanup: Stop all jobs when script exits
    Write-Host "`n`nStopping services..." -ForegroundColor Yellow
    Stop-Job -Job $job1, $job2 -ErrorAction SilentlyContinue
    Remove-Job -Job $job1, $job2 -Force -ErrorAction SilentlyContinue
    Write-Host "Services stopped. Goodbye!" -ForegroundColor Green
}
