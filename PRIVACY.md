# Informativa sulla privacy — Chrome HUD New Tab

**Ultimo aggiornamento:** 9 luglio 2026

Chrome HUD New Tab ("l'estensione") sostituisce la pagina Nuova scheda di Chrome
con una dashboard personale (orologio, meteo, attività di Google Tasks, news e
scorciatoie). Questa informativa spiega quali dati vengono trattati e come.

## In sintesi

- **Non raccogliamo, non memorizziamo e non vendiamo i tuoi dati personali.**
- L'estensione **non ha server propri**: non riceviamo né conserviamo alcuna
  informazione su di te.
- **Nessuna pubblicità, nessun tracciamento, nessuna profilazione, nessuna analytics.**
- Le tue impostazioni restano **solo sul tuo dispositivo**.

## Dati trattati e finalità

### Impostazioni locali
Le tue preferenze (tema, sfondo, disposizione dei widget, città del meteo,
scorciatoie) sono salvate localmente nel tuo browser tramite l'API
`chrome.storage`. Non lasciano il tuo dispositivo, se non attraverso la normale
sincronizzazione di Chrome del tuo account, gestita da Google.

### Posizione (geolocalizzazione)
Se attivi il widget Meteo, l'estensione può richiedere la tua posizione
approssimativa per mostrare meteo e qualità dell'aria della tua zona. Le
coordinate sono usate **solo** per interrogare i servizi meteo indicati sotto e
**non vengono salvate né inviate allo sviluppatore**.

### Account Google e Google Tasks
Se usi il widget Attività, l'estensione ti autentica con il tuo account Google
tramite OAuth (permesso `identity`) per **leggere e aggiornare le tue attività di
Google Tasks**. Questi dati transitano **direttamente tra il tuo browser e i
server di Google**: lo sviluppatore non li riceve, non li vede e non li conserva.
L'ambito richiesto è limitato a `https://www.googleapis.com/auth/tasks`.

## Servizi di terze parti contattati

L'estensione contatta questi servizi solo per popolare i widget. A ciascuno viene
inviato esclusivamente il minimo necessario:

| Servizio | Dato inviato | Scopo |
|---|---|---|
| Open-Meteo | coordinate geografiche | previsioni meteo |
| Air Quality — Open-Meteo | coordinate geografiche | qualità dell'aria |
| Nominatim / OpenStreetMap | nome città digitato | conversione città → coordinate |
| rss2json e le testate configurate | nessun dato personale | recupero notizie |
| Google Tasks API | token OAuth dell'utente | lettura/scrittura attività |

L'uso di questi servizi è soggetto alle rispettive informative sulla privacy.

## Condivisione dei dati

Non condividiamo, vendiamo o trasferiamo dati a terzi. Non usiamo i dati per scopi
diversi dalla funzionalità descritta, né per valutazioni creditizie o prestiti.

## Sicurezza

Non essendoci un server dello sviluppatore, non esiste un archivio centralizzato
dei tuoi dati che possa essere violato. I dati restano sul tuo dispositivo o
presso i servizi di Google/terze parti che scegli di usare.

## Minori

L'estensione non è indirizzata a minori di 13 anni e non raccoglie
intenzionalmente dati da minori.

## Modifiche

Eventuali aggiornamenti a questa informativa saranno pubblicati in questa pagina,
con la data di "Ultimo aggiornamento" aggiornata.

## Contatti

Per domande su questa informativa: **andrealentini86@gmail.com**
