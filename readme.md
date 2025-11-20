# MOST Dashboard

## 1. Installazione

L'installazione è da eseguirsi solo al primo uso.

### 1.1 Installazione dei tool

Aprire PowerShell e incollare il seguente comando:
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```
Chiudere PowerShell.

Scaricare ed eseguire l'installer `nvm-setup.exe` dalla pagina al seguente indirizzo:

https://github.com/coreybutler/nvm-windows/releases

Terminata l'installazione, riaprire PowerShell e lanciare i seguenti comandi:
```powershell
nvm install 24.0.0
```

Al termine dell'esecuzione, lanciare

```powershell
nvm use 24.0.0
```

### 1.2 Installazione della dashboard

Scaricare questo repository come zip.

Decomprimere lo zip.

Aprire la cartella ottenuta nel terminale (tasto destro sulla cartella > apri nel terminale).

> Attenzione: può capitare che, dopo la decompressione, la cartella sia contenuta in un'altra cartella con lo stesso nome. In tal caso, aprire il terminale in quella più interna.

Procedere con l'installazione eseguendo il seguente comando nel terminale:

```powershell
powershell -ExecutionPolicy ByPass .\install.ps1
```

## 2. Uso

Una volta eseguita l'installazione, per lanciare la dashboard (sempre da un terminale localizzato nella cartella):

```powershell
powershell -ExecutionPolicy ByPass .\dashboard.ps1
```

La dashboard sarà visibile nel browser all'indirizzo http://localhost:4173/.

La dashboard può essere disattivata premendo `CTRL+C` all'interno del terminale.
