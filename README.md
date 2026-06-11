# Chrome HUD Dashboard

Una dashboard moderna, minimalista ed elegante in stile "HUD" cibernetico per la nuova scheda (New Tab) di Google Chrome. 

## Funzionalità Principali

- **Orologio e Data**: Sincronizzati in tempo reale.
- **Widget Meteo**: Geolocalizzazione automatica o ricerca manuale tramite API Open-Meteo, con indicatori per temperatura, umidità, indice UV e qualità dell'aria (AQI).
- **Google Services**: Accesso rapido a Gmail, Drive, Calendar, Maps, Translate, Docs, Sheets, Meet e Gemini.
- **Google Tasks**: Sincronizzazione in tempo reale con il tuo account Google. Permette di:
  - Visualizzare i task attivi e completati (tramite tab).
  - Aggiungere nuovi task sia testualmente che **vocalmente** tramite microfono (Web Speech API).
  - Segnare i task come completati.
- **News Online**: Feed RSS dal Sole 24 Ore, con categoria personalizzabile tramite le impostazioni (Finanza, Tecnologia, Italia, Mondo, Sport).
- **Scorciatoie Preferite**: Link rapidi ai tuoi siti e progetti più usati.
- **Aforismi Motivazionali**: Una rotazione di frasi celebri che si aggiornano ad ogni caricamento della scheda, con pulsante di aggiornamento manuale.
- **Widget Spotify**: Iframe integrato (abilitabile/disabilitabile dalle impostazioni).
- **Temi Avanzati (Filtri Olografici)**: Supporto a tre temi senza ricaricamento della pagina:
  - **DARK (Ciano)**: Il classico tema cibernetico.
  - **DEV (Viola)**: Estetica neon/viola perfetta per programmatori.
  - **LIGHT (Ghiaccio)**: Interfaccia glassmorphism su sfondo semitrasparente.
- **Personalizzazione**: Sfondo globale (con sfondo di default "Iron Man") e Nome Utente personalizzabili, salvati localmente.

## Architettura e Tecnologie

Il progetto non necessita di server backend proxy. Funziona al 100% lato client ed è impacchettato tramite Vite.
- **React 19 & TypeScript**: Logica strutturata a componenti funzionali (`src/components/*.tsx`), con gestione dello stato globale.
- **Tailwind CSS**: Utility-first styling integrato tramite PostCSS e Vite.
- **Google Identity API (`chrome.identity`)**: Autenticazione OAuth 2.0 sicura per l'accesso ai Tasks di Google, direttamente integrata nel manifest.

## Installazione e Sviluppo

1. Clona o scarica la repository.
2. Assicurati di avere [Node.js](https://nodejs.org/) installato.
3. Installa le dipendenze:
   ```bash
   npm install
   ```
4. **Configura il file manifest:**
   - Copia il file `public/manifest.example.json` in `public/manifest.json`.
   - Apri `public/manifest.json` e sostituisci `"INSERISCI_QUI_IL_TUO_CLIENT_ID"` con il tuo vero `client_id` OAuth 2.0.
5. Per compilare l'estensione (genera la cartella `dist` da caricare su Chrome):
   ```bash
   npm run build
   ```
6. Carica l'estensione su Chrome:
   - Apri `chrome://extensions/`
   - Abilita la **Modalità Sviluppatore** in alto a destra.
   - Clicca su **Carica estensione non pacchettizzata** e seleziona la cartella `dist` che si è creata nel progetto.

## Configurazione API di Google

Per fare in modo che il widget di Google Tasks funzioni, è **necessario** configurare correttamente l'ambiente OAuth 2.0 su Google Cloud Console. 
Segui la guida completa nel file [GOOGLE_TASKS_SETUP.md](./GOOGLE_TASKS_SETUP.md) incluso in questa cartella.

## Sicurezza
Il file `public/manifest.json` è stato inserito nel `.gitignore` e non viene tracciato per impedire il caricamento accidentale del tuo vero `client_id` su GitHub. Per distribuire o installare l'estensione usa `public/manifest.example.json` come base di partenza.
Il codice non necessita di file `.env` poiché il flusso OAuth delle estensioni Chrome si basa esclusivamente sul `client_id` (pubblico) integrato nel manifest. Non esistono `client_secret` esposti in questa architettura.

## Licenza
MIT License
