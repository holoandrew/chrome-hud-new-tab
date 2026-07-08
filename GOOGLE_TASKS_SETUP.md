# Configurazione API di Google Tasks per Chrome Extension

Questa estensione comunica nativamente con l'account Google dell'utente per gestire le "Tasks". 
Affinché i tuoi colleghi possano utilizzarla senza ricevere errori di autenticazione ("Errore 403: access_denied" o "App non verificata"), dovrai configurare correttamente un progetto Google Cloud.

Ecco i passaggi da seguire o da condividere con il tuo team per creare le proprie credenziali.

## 1. Creare un Progetto su Google Cloud Console

1. Vai su [Google Cloud Console](https://console.cloud.google.com/).
2. Accedi con il tuo account Google.
3. Clicca sul menu a tendina dei progetti in alto a sinistra e seleziona **Nuovo progetto**.
4. Dai un nome al progetto (es. `Chrome HUD Dashboard`) e clicca su **Crea**.
5. Attendi che venga creato, poi selezionalo per renderlo il progetto attivo.

## 2. Abilitare l'API di Google Tasks

1. Clicca sul menu ad hamburger (≡) in alto a sinistra.
2. Vai su **API e servizi > Libreria**.
3. Nella barra di ricerca, scrivi "Google Tasks API".
4. Clicca sul risultato e poi premi **Abilita**.

## 3. Configurare la Schermata di Consenso OAuth (Fondamentale!)

1. Nel menu a sinistra, vai su **API e servizi > Schermata di consenso OAuth**.
2. Scegli **Esterno** (se l'estensione sarà usata da account @gmail.com) oppure **Interno** (se fate parte di una Google Workspace aziendale e volete restringerlo solo all'azienda). Clicca **Crea**.
3. **Informazioni App**:
   - Inserisci un nome per l'app (es. "HUD Dashboard").
   - Inserisci la tua email come email di assistenza.
   - (Opzionale) Aggiungi un logo.
4. **Domini autorizzati**: Lascia vuoto o inserisci il tuo dominio se ne possiedi uno.
5. Clicca **Salva e Continua**.
6. **Ambiti (Scopes)**: Clicca su "Aggiungi o Rimuovi ambiti" e cerca/seleziona `https://www.googleapis.com/auth/tasks`. Clicca Aggiorna, poi **Salva e Continua**.
7. **Utenti di Test (Solo se l'app è "Esterna" e in fase di test)**:
   - Se hai scelto "Esterno", la tua app è in stato di "Testing". Google non permette l'accesso a nessuno tranne agli utenti autorizzati.
   - Clicca **Aggiungi utenti** e inserisci le email Gmail dei tuoi colleghi a cui vuoi passare l'estensione. Senza questo passaggio, vedranno l'Errore 403.
   - Clicca **Salva e Continua**.

*(Nota: per evitare di dover inserire ogni volta le mail dei colleghi nei Test Users, puoi pubblicare l'app. Tuttavia, per gli ambiti "sensibili" come Tasks, Google potrebbe richiedere una verifica formale dell'applicazione.)*

## 4. Creare le Credenziali (ID Client)

1. Vai su **API e servizi > Credenziali**.
2. Clicca in alto su **+ Crea credenziali** e scegli **ID client OAuth**.
3. Come **Tipo di applicazione** seleziona **Estensione di Chrome**.
4. Nel campo **ID articolo**, devi inserire l'ID univoco della tua estensione Chrome.
   - *Come trovarlo*: Installa l'estensione (la cartella `dist`) su Chrome abilitando la modalità sviluppatore. Sulla card dell'estensione vedrai un campo "ID: [sequenza di lettere, es: abcdefghijklmnopqrstuvwxyz]".
   - Copia quella sequenza e incollala qui.
5. Clicca su **Crea**.
6. Google ti fornirà un **ID client** simile a `123456789-abcde...apps.googleusercontent.com`. Copialo.

## 5. Aggiornare l'Estensione con il nuovo ID

1. Apri il file `manifest.json` presente nel progetto (nella cartella `public/manifest.json` o nel sorgente).
2. Sostituisci il campo `client_id` esistente con il tuo nuovo ID client appena copiato:
   ```json
   "oauth2": {
     "client_id": "INSERISCI_QUI_IL_TUO_NUOVO_CLIENT_ID",
     "scopes": [
       "https://www.googleapis.com/auth/tasks"
     ]
   }
   ```
3. Ricompila il progetto lanciando il comando `npm run build` dal terminale.
4. Clicca sul tastino 🔄 (Aggiorna) sulla card dell'estensione in `chrome://extensions/`.

Ecco fatto! Ora se i tuoi colleghi cliccano su "GOOGLE_TASKS // AUTH_REQ", la finestra di Google si aprirà correttamente e permetterà loro di loggarsi e visualizzare i loro impegni.

## 6. Mantenere lo stesso ID su più PC (installazione multi-macchina)

> **Perché serve:** l'`ID client OAuth` di tipo "Estensione di Chrome" è legato a uno **specifico ID di estensione**. Un'estensione caricata "non pacchettizzata" ottiene un ID **diverso su ogni PC/percorso**. Se installi la stessa estensione su un secondo PC senza accorgimenti, l'ID cambia e Google restituisce `403 / bad client id` — anche copiando lo stesso identico `manifest.json`, perché l'ID non dipende dal contenuto del file ma dal percorso della cartella `dist` su quel PC.

La soluzione pulita è aggiungere un campo `key` al manifest: così l'ID dell'estensione diventa **identico su tutti i PC** e un solo `client_id` OAuth funziona ovunque.

> ✅ **Questo repo ha già un `key` impostato** in `public/manifest.example.json` (quindi presente anche nel tuo `public/manifest.json`, se l'hai copiato da lì dopo questo aggiornamento). L'ID risultante, uguale su qualsiasi PC/percorso, è:
> ```
> chbeigpambedgegommgifghachmpmmbf
> ```
> **Vai su [Google Cloud Console → Credenziali](https://console.cloud.google.com/apis/credentials)**, apri l'ID client OAuth "Estensione di Chrome" collegato al tuo `client_id`, e imposta (o verifica) l'**ID articolo** su questo valore. Una volta fatto, l'autenticazione funzionerà identica su ogni PC dove carichi questo repo, senza dover generare nulla.
>
> Se invece preferisci una chiave tua (es. per pubblicare la tua fork), segui i passi sotto per generarne una nuova — sostituirà quella di default.

### Come generare il `key`

1. Sul primo PC, apri `chrome://extensions/`, clicca **Pacchettizza estensione** (Pack extension), seleziona la cartella `dist` e lascia vuoto il campo della chiave privata. Chrome genererà due file accanto alla cartella: `dist.crx` e **`dist.pem`** (la chiave privata — conservala e **non** committarla).
2. Ricava la stringa `key` dalla chiave privata. Ti serve `openssl` (incluso in Git Bash su Windows):
   ```bash
   openssl rsa -in dist.pem -pubout -outform DER | openssl base64 -A
   ```
   Copia la lunga stringa base64 restituita.
3. Aggiungi il campo `key` in cima al tuo `public/manifest.json` (e, se vuoi che resti nel template condiviso, anche in `public/manifest.example.json`):
   ```json
   {
     "manifest_version": 3,
     "key": "INCOLLA_QUI_LA_STRINGA_BASE64",
     "name": "Chrome HUD New Tab",
     ...
   }
   ```
4. Ricompila (`npm run build`) e ricarica l'estensione. In `chrome://extensions/` l'**ID ora sarà stabile** e uguale su ogni PC che usa lo stesso `key`.
5. Verifica che questo ID coincida con quello registrato nell'**ID client OAuth** (passo 4). Se non coincide, aggiornalo o crea un nuovo ID client con l'ID corretto.

> Nota: il file `.pem` è la tua chiave privata di firma — trattalo come una password. Il `key` nel manifest è invece la chiave **pubblica** e può stare nel repo senza rischi.

### Alternativa senza `key`

Se preferisci non usare il `key`, su ogni nuovo PC:
1. Carica l'estensione e leggi il nuovo **ID** in `chrome://extensions/`.
2. Vai su Google Cloud Console → **Credenziali** → crea un ulteriore **ID client OAuth → Estensione di Chrome** con quel nuovo ID (puoi tenere più client sulla stessa app).
3. Metti il `client_id` corrispondente nel `manifest.json` di quel PC.
