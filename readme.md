# MOST Dashboard

## 1. Installazione

### 1.1 Installazione dei tool

Aprire PowerShell e incollare il seguente comando:
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```
Chiudere PowerShell.

Scaricare ed eseguire l'installer al seguente indirizzo:

https://github.com/coreybutler/nvm-windows/releases

Riaprire PowerShell e lanciare i seguenti comandi:
```powershell
nvm install 24.0.0
nvm use 24.0.0
```

### 1.2 Installazione della dashboard

Aprire la cartella nel terminale (tasto destro > apri nel terminale).

Procedere con l'installazione eseguendo:

```powershell
powershell -ExecutionPolicy ByPass .\install.ps1
```

Una volta eseguita l'installazione, per lanciare la dashboard:

```powershell
powershell -ExecutionPolicy ByPass .\dashboard.ps1
```

La dashboard sarà visibile nel browser all'indirizzo http://localhost:4173/
