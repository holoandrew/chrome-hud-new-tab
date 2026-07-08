---
tags: [progetto, handoff, chrome-dashboard]
stato: in-corso
riferimento: "README.md, GOOGLE_TASKS_SETUP.md"
creato: 2026-07-08
aggiornato: 2026-07-08
---

# Chrome HUD Dashboard — Stato Avanzamento (handoff)

> Documento vivo per continuare in una nuova sessione (Claude Code sul secondo PC). Aggiornare a fine di ogni STEP.

## Dove siamo
- STEP 1 — Aggiornamento README.md e GOOGLE_TASKS_SETUP.md: ✅ (2026-07-08, documentazione allineata al codice reale, aggiunta guida install multi-PC)
- STEP 2 — Opzione "Sfondo Predefinito" in Impostazioni: ✅ (2026-07-08, sostituito riferimento rotto a `bg-minimal.jpg`)
- STEP 3 — Messaggio d'errore reale su AUTH_REQ (Google Tasks): ✅ (2026-07-08, `TasksWidget.tsx`)
- STEP 4 — Pulizia trailer "Co-Authored-By: Claude" dai commit: ✅ (2026-07-08, cronologia riscritta e pushata)
- STEP 5 — Chiave manifest stabile per ID estensione fisso multi-PC: ✅ generata e pushata, ⏸ **da verificare sul secondo PC**
- **Prossimo**: sul secondo PC, eseguire STEP 5 lato utente (pull, build, reload estensione, allineare Item ID su Google Cloud Console) e confermare che Google Tasks si autentica correttamente. Vedi "Primo comando concreto" in fondo.

## Ambiente confermato
- OS: Windows 11 Home 10.0.26200. Shell primaria: PowerShell 5.1; Git Bash disponibile e necessario per alcuni comandi (vedi Correzioni).
- Node **v25.2.1**, npm **11.6.2**, git **2.45.0.windows.1** (versioni di questo PC, verificarle sull'altro — potrebbero differire).
- Repo locale: `D:\chrome-dashboard`. ⚠️ Sul secondo PC il percorso potrebbe essere diverso: non è un problema per il codice, ma se in passato è stato usato per calcolare un ID estensione "a mano" (senza `key`), quell'ID sarà diverso — è proprio il problema che lo STEP 5 risolve.
- Remote GitHub: `https://github.com/holoandrew/chrome-hud-new-tab.git`, branch `main`, nessun altro branch attivo.
- Ultimo commit pushato: `20c34c4` "Aggiunge key stabile al manifest per ID estensione fisso multi-PC".
- `public/manifest.json` **non è tracciato** (gitignored) — va creato a mano da `public/manifest.example.json` su ogni PC, poi inserito il `client_id` reale.
- `client_id` OAuth attualmente in uso: presente in `public/manifest.json` locale di questo PC (file non tracciato — non riportato qui per non esporlo su GitHub, coerente con la policy in README.md).
- **Extension ID atteso ora su qualsiasi PC** (grazie al campo `"key"` aggiunto in `public/manifest.example.json`, committato in git): `chbeigpambedgegommgifghachmpmmbf`. Deve coincidere con l'**ID articolo** dell'ID client OAuth "Estensione di Chrome" su Google Cloud Console — questo è il collegamento da verificare/creare sul secondo PC.
- Chiave privata di firma (`.pem`), NON nel repo, backup in: `C:\Users\andre\chrome-dashboard-private-keys\chrome-ext-key.pem` (su questo PC). Non serve per l'uso quotidiano dell'estensione, solo se in futuro serve rigenerare o ri-pacchettizzare.

## Correzioni alla guida / decisioni prese
- Il tema **MINIMAL** referenziava `public/bg-minimal.jpg`, file mai esistito nel repo (causava un warning di build e comunque non era mai visibile, coperto da un div sopra). Sostituito con un preset via gradiente CSS (`linear-gradient(135deg, #f8fafc, #e2e8f0)`) selezionabile dalle Impostazioni ("Sfondo Predefinito"), senza bisogno di asset esterni.
- **Bug scoperto in `git filter-branch`**: combinare due script `-e` in sed — uno per cancellare il trailer (`/^Co-Authored-By: Claude/d`) e uno per comprimere righe vuote consecutive (`/^$/N;/^\n$/D`) — fa sì che il secondo script "inghiotta" la riga del trailer nel pattern space (tramite `N`) **prima** che il primo script possa testarla come riga corrente a inizio ciclo. Risultato: nessun errore, ma il trailer non veniva rimosso. Fix: usare solo `sed -e "/^Co-Authored-By: Claude/d"`, senza il secondo filtro.
- Comandi con virgolette annidate complesse (come lo script sed sopra) **vanno eseguiti in Git Bash**, non in PowerShell: PowerShell 5.1 spezza il quoting in modo diverso e passa argomenti mangled a git/sed (errore tipo "fatal: ambiguous argument").
- Regola globale salvata in `~/.claude/CLAUDE.md` (poi estesa dall'utente anche alle sessioni Cowork): **mai** aggiungere la riga `Co-Authored-By: Claude ...` (o simili tipo "🤖 Generated with...") nei messaggi di commit, in nessun repository.
- Force-push su `main`: per policy Claude Code non lo esegue mai da sé, nemmeno su richiesta esplicita dell'utente — prepara i comandi pronti e li fa eseguire manualmente all'utente.
- Algoritmo di calcolo dell'**ID estensione Chrome** da una chiave pubblica (usato per generare l'ID deterministico sopra): SHA-256 della chiave pubblica in formato DER, primi 16 byte, ogni nibble (valore 0–15) mappato a una lettera `a`–`p`. È l'algoritmo reale usato da Chrome — permette di calcolare l'ID risultante *prima* di caricare l'estensione, senza dover controllare `chrome://extensions/`.
- **Causa radice del problema "Google Tasks non funziona sul secondo PC"**: senza un campo `"key"` nel manifest, Chrome calcola l'ID di un'estensione "non pacchettizzata" dal **percorso assoluto della cartella** `dist`, non dal contenuto del file. Quindi copiare lo stesso identico `manifest.json` (stesso `client_id`) tra due PC **non basta**: l'ID reale differisce comunque, e Google rifiuta l'OAuth (`bad client id` / `403`) perché quel `client_id` è registrato per un ID diverso su Google Cloud Console.

## STEP — esito e deviazioni

**STEP 1 (README/guida)**: riscritti `README.md` e `GOOGLE_TASKS_SETUP.md` per riflettere le feature reali del codice (search bar con autocomplete + AI Mode, thumbnail news, layout drag & drop, notifiche task) e aggiunta sezione su installazione multi-PC. Verificato con `npm run build` e `npm run typecheck` puliti prima di committare.

**STEP 2 (Sfondo Predefinito)**: aggiunto `backgroundPreset: 'ironman' | 'minimal'` in `src/GlobalContext.tsx`, logica in `src/App.tsx` (`BACKGROUND_PRESETS` map), select in `src/components/SettingsModal.tsx`. Rimossa la riga CSS rotta in `src/style.css` (`body.theme-minimal { background-image: url(...) }`). Testato dal vivo con preview browser: selezionando "Minimal" il gradiente si applica correttamente all'elemento giusto (`#root > div`, non il `<body>` che ha classi omonime ma nessuno stile inline).

**STEP 3 (errore AUTH_REQ reale)**: in `src/components/TasksWidget.tsx`, funzione `handleLogin`, distinta la causa `chrome.identity` assente (dev mode / non caricato come estensione) da un vero errore OAuth (mostra `e.message` + checklist: ID client OAuth corrisponde all'estensione, Tasks API abilitata, utente in lista Test). Verificato in preview: il ramo "chrome.identity assente" produce il messaggio corretto.

**STEP 4 (pulizia commit)**: 9 commit (`6e6d575..main`) riscritti con `git filter-branch -f --msg-filter 'sed -e "/^Co-Authored-By: Claude/d"' 6e6d575..main`, poi `git push --force-with-lease origin main` (eseguito dall'utente). Verificato dopo il push: `git log origin/main --format="%B" | grep -i co-authored` non trova nulla. Contenuto dei file identico a prima (solo hash/messaggi cambiati) — confermato con `git diff --stat` prima del push.

**STEP 5 (key manifest, extension ID stabile)**: generata chiave RSA 2048 bit con `openssl genrsa`, derivata la stringa base64 della chiave pubblica DER (`openssl rsa -pubout -outform DER | openssl base64 -A`), calcolato l'ID con lo script Python descritto sopra → `chbeigpambedgegommgifghachmpmmbf`. Aggiunto campo `"key"` a `public/manifest.json` (locale) e `public/manifest.example.json` (tracciato — è la chiave **pubblica**, sicura da committare). Verificato che `dist/manifest.json` dopo `npm run build` contenga il campo. Chiave privata spostata fuori dal repo. **Non ancora verificato**: che l'autenticazione funzioni davvero dopo aver allineato l'Item ID su Google Cloud Console — questo è il passo che manca.

## Contesto + regole per la nuova sessione

Sei Claude Code sul secondo PC dell'utente, per il progetto **Chrome HUD Dashboard** (estensione Chrome per la New Tab, React 19 + TypeScript + Vite + Tailwind). Il repo va clonato/aggiornato da `https://github.com/holoandrew/chrome-hud-new-tab.git`, branch `main`.

Regole ferme:
- Non aggiungere **mai** `Co-Authored-By: Claude` (o simili) nei commit — regola globale già salvata in `~/.claude/CLAUDE.md` dell'utente, vale su ogni repo.
- Non fare **mai** `git push --force` su `main` da solo, nemmeno se sembra la soluzione più comoda — prepara i comandi e falli eseguire all'utente.
- `public/manifest.json` non va mai committato (è gitignored): va creato copiando `public/manifest.example.json` e inserendo il `client_id` reale dell'utente.
- **Non rigenerare la chiave `"key"`** nel manifest: è già fissata e pushata in `public/manifest.example.json`; se la si rigenera, l'ID estensione cambia e si rompe di nuovo l'allineamento con Google Cloud Console. Copiare quella già presente nel repo.
- Prima di ogni comando distruttivo su git, controlla `git status`.

Il problema aperto in sospeso: l'utente ha segnalato che Google Tasks non si autentica su un secondo PC pur avendo copiato `client_id` corretto. Causa identificata: l'estensione "non pacchettizzata" prende un ID diverso per ogni percorso/PC senza un campo `"key"` nel manifest — e quindi anche con lo stesso file copiato, l'ID reale non coincideva con quello registrato su Google Cloud Console. È stata aggiunta una `key` stabile (già in `public/manifest.example.json`, pushata) che fissa l'ID a `chbeigpambedgegommgifghachmpmmbf` su qualsiasi PC. Resta da fare, su questo secondo PC, l'allineamento lato Google Cloud Console e la verifica finale.

## Primo comando concreto

```bash
git pull origin main
npm install
cp public/manifest.example.json public/manifest.json   # poi inserire il client_id reale nel file
npm run build
```
Poi ricaricare l'estensione in `chrome://extensions/` (tastino 🔄), controllare che l'ID mostrato sia `chbeigpambedgegommgifghachmpmmbf`, andare su [Google Cloud Console → Credenziali](https://console.cloud.google.com/apis/credentials) e impostare l'**ID articolo** dell'ID client OAuth "Estensione di Chrome" su quel valore. Infine riprovare "AUTH_REQ" nel widget Tasks e riportare l'esito (o il messaggio d'errore esatto, ora dettagliato grazie allo STEP 3).
