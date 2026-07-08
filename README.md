# Chrome HUD Dashboard

Una dashboard moderna, minimalista ed elegante in stile "HUD" cibernetico per la nuova scheda (New Tab) di Google Chrome.

> **Versione 2.0** — React 19 + TypeScript + Tailwind, impacchettata con Vite come estensione Chrome (Manifest V3).

## Funzionalità Principali

- **Orologio e Data**: Sincronizzati in tempo reale.
- **Barra di Ricerca Google**: Ricerca integrata con **autocompletamento** dei suggerimenti Google in tempo reale (navigabile da tastiera con ↑/↓/Invio) e toggle **AI Mode** per aprire i risultati nella modalità AI di Google. Attivabile/disattivabile dalle impostazioni.
- **Widget Meteo**: Geolocalizzazione automatica o ricerca manuale tramite API Open-Meteo, con indicatori per temperatura, umidità, indice UV e qualità dell'aria (AQI).
- **Google Services**: Accesso rapido a Gmail, Drive, Calendar, Maps, Translate, Docs, Sheets e Gemini.
- **Google Tasks**: Sincronizzazione in tempo reale con il tuo account Google. Permette di:
  - Visualizzare i task attivi e completati (tramite tab).
  - Aggiungere nuovi task sia testualmente che **vocalmente** tramite microfono (Web Speech API).
  - Segnare i task come completati.
  - **Notifiche di sistema** per i task in scadenza oggi (controllo in background ogni 60 minuti).
- **News Online**: Feed RSS con **thumbnail** per ogni notizia, categoria personalizzabile dalle impostazioni (Tecnologia, Italia, Mondo, Finanza da *Il Sole 24 Ore* e Sport dal *Corriere dello Sport*). Il CORS viene gestito internamente dal service worker dell'estensione, senza server esterni.
- **Scorciatoie Preferite**: Link rapidi ai tuoi siti e progetti più usati.
- **Aforismi Motivazionali**: Una rotazione di frasi celebri che si aggiornano ad ogni caricamento della scheda, con pulsante di aggiornamento manuale.
- **Widget Spotify**: Iframe integrato (abilitabile/disabilitabile dalle impostazioni).
- **Layout Personalizzabile (Drag & Drop)**: Riordina e sposta i widget tra le colonne con il trascinamento (attiva la modalità "Layout Widget" dall'icona in alto a destra). Il layout viene salvato localmente.
- **Temi Avanzati (Filtri Olografici)**: Supporto a quattro temi senza ricaricamento della pagina:
  - **DARK (Ciano)**: Il classico tema cibernetico.
  - **DEV (Viola)**: Estetica neon/viola perfetta per programmatori.
  - **LIGHT (Ghiaccio)**: Interfaccia glassmorphism su sfondo semitrasparente.
  - **MINIMAL (Apex-like)**: Tema essenziale ad alto contrasto.
- **Personalizzazione**: Sfondo globale caricabile (o preset predefinito a scelta tra "Iron Man" scuro e "Minimal" chiaro), opacità dell'overlay e Nome Utente personalizzabili, tutti salvati localmente. Ogni widget può essere mostrato/nascosto dalle impostazioni.

## Architettura e Tecnologie

Il progetto funziona al 100% lato client ed è impacchettato tramite Vite. Non necessita di server backend proprietari: le richieste cross-origin (feed RSS) vengono instradate dal **service worker** dell'estensione (`public/background.js`).

- **React 19 & TypeScript**: Logica strutturata a componenti funzionali (`src/components/*.tsx`), con stato globale via Context (`src/GlobalContext.tsx`).
- **Tailwind CSS**: Utility-first styling integrato tramite PostCSS e Vite.
- **framer-motion**: Animazioni dell'interfaccia.
- **react-sortablejs**: Riordino dei widget in drag & drop.
- **Manifest V3 + Service Worker**: Alarms, notifiche e proxy CORS gestiti in `public/background.js`.
- **Google Identity API (`chrome.identity`)**: Autenticazione OAuth 2.0 per l'accesso a Google Tasks, configurata nel manifest.

### Struttura del progetto

```
chrome-dashboard/
├── public/
│   ├── manifest.example.json   # Template del manifest (tracciato su git)
│   ├── manifest.json           # Il tuo manifest reale con client_id (NON tracciato)
│   ├── background.js           # Service worker: alarms, notifiche, proxy CORS
│   ├── bg-default.jpg          # Sfondo di default
│   └── icon.png
├── src/
│   ├── components/             # Widget React (.tsx)
│   ├── App.tsx
│   ├── GlobalContext.tsx
│   └── style.css
├── index.html
└── package.json
```

## Installazione

Segui questi passi su **ogni PC** su cui vuoi installare l'estensione.

1. Clona la repository:
   ```bash
   git clone https://github.com/holoandrew/chrome-hud-new-tab.git
   cd chrome-hud-new-tab
   ```
2. Assicurati di avere [Node.js](https://nodejs.org/) installato (versione 18+ consigliata).
3. Installa le dipendenze:
   ```bash
   npm install
   ```
4. **Configura il file manifest** (obbligatorio, perché `public/manifest.json` non è tracciato su git):
   ```bash
   # Windows (PowerShell)
   Copy-Item public/manifest.example.json public/manifest.json
   # macOS / Linux
   cp public/manifest.example.json public/manifest.json
   ```
   Apri `public/manifest.json` e sostituisci `"INSERISCI_QUI_IL_TUO_CLIENT_ID"` con il tuo vero `client_id` OAuth 2.0 (vedi [GOOGLE_TASKS_SETUP.md](./GOOGLE_TASKS_SETUP.md)).
5. Compila l'estensione (genera la cartella `dist` da caricare su Chrome):
   ```bash
   npm run build
   ```
6. Carica l'estensione su Chrome:
   - Apri `chrome://extensions/`
   - Abilita la **Modalità Sviluppatore** in alto a destra.
   - Clicca su **Carica estensione non pacchettizzata** e seleziona la cartella `dist` che si è creata nel progetto.

### Sviluppo

Per lavorare sull'interfaccia con hot-reload nel browser (senza le API di Chrome):
```bash
npm run dev        # avvia Vite in modalità sviluppo
npm run typecheck  # controllo TypeScript senza build
```
> Nota: in modalità `dev` le funzioni che richiedono `chrome.*` (Tasks, notifiche, proxy CORS) non sono disponibili. Le news usano automaticamente un proxy di ripiego. Per testare tutto è necessario caricare la cartella `dist` come estensione.

## Configurazione API di Google

Per far funzionare il widget di Google Tasks è **necessario** configurare l'ambiente OAuth 2.0 su Google Cloud Console.
Segui la guida completa in [GOOGLE_TASKS_SETUP.md](./GOOGLE_TASKS_SETUP.md).

## ⚠️ Installazione su più PC — ID estensione stabile

Questo è il punto più importante quando installi l'estensione su un **secondo PC**.

Il `client_id` OAuth di Google è legato all'**ID dell'estensione Chrome**. Un'estensione caricata "non pacchettizzata" riceve però un ID **diverso su ogni macchina/percorso**, a meno che il manifest non contenga un campo `key`. Se l'ID cambia, Google Tasks restituirà un errore di autenticazione (403 / `bad client id`) perché quell'ID non risulta registrato nelle credenziali OAuth.

Hai due opzioni:

- **Opzione A — Stesso ID ovunque (consigliata).** Aggiungi un campo `key` al manifest così l'ID resta identico su tutti i PC e un solo client OAuth funziona ovunque. Vedi la sezione "Mantenere lo stesso ID su più PC" in [GOOGLE_TASKS_SETUP.md](./GOOGLE_TASKS_SETUP.md).
- **Opzione B — Un client OAuth per PC.** Installa l'estensione sul nuovo PC, leggi il nuovo ID in `chrome://extensions/`, e crea un ulteriore *ID client OAuth (Estensione di Chrome)* con quell'ID sulla stessa app Google Cloud.

## Sicurezza

- `public/manifest.json` è nel `.gitignore` e **non viene tracciato**, per evitare di caricare il tuo `client_id` su GitHub. Usa `public/manifest.example.json` come base.
- Non serve alcun file `.env`: il flusso OAuth delle estensioni Chrome usa solo il `client_id` (pubblico) nel manifest. Non esistono `client_secret` esposti in questa architettura.
- Il testo dei feed RSS viene sanificato via `DOMParser` (nessun `innerHTML`), quindi senza rischio XSS.

## Licenza

MIT License
