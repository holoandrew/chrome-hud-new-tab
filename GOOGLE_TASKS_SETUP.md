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
