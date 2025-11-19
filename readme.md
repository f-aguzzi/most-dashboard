# MOST Dashboard

## 1. Installazione

### 1.1 Installazione dei tool

Aprire PowerShell e incollare il seguente comando:
```ps
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```
Chiudere PowerShell.

Scaricare ed eseguire l'installer al seguente indirizzo:

https://github.com/coreybutler/nvm-windows/releases

Riaprire PowerShell e lanciare i seguenti comandi:
```ps
nvm install 24.0.0
nvm use 24.0.0
```

### 1.2 Installazione della dashboard

Lanciare come amministratore lo script `install.ps1` contenuto in questa cartella.
