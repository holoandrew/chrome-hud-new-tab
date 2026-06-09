const quotes = [
    { text: "L'unico modo per fare un ottimo lavoro è amare quello che fate.", author: "Steve Jobs" },
    { text: "Il futuro appartiene a coloro che credono nella bellezza dei propri sogni.", author: "Eleanor Roosevelt" },
    { text: "Sii il cambiamento che vuoi vedere nel mondo.", author: "Mahatma Gandhi" },
    { text: "La logica vi porterà da A a B. L'immaginazione vi porterà dappertutto.", author: "Albert Einstein" },
    { text: "Non ho fallito. Ho solamente trovato 10.000 modi che non funzioneranno.", author: "Thomas A. Edison" },
    { text: "Il modo migliore per predire il futuro è inventarlo.", author: "Alan Kay" },
    { text: "Non smettere mai di imparare, perché la vita non smette mai di insegnare.", author: "Proverbio" },
    { text: "Un viaggio di mille miglia comincia sempre con un singolo passo.", author: "Lao Tzu" },
    { text: "L'intelligenza è la capacità di adattarsi al cambiamento.", author: "Stephen Hawking" },
    { text: "La semplicità è l'ultima sofisticazione.", author: "Leonardo da Vinci" },
    { text: "Fai o non fare. Non c'è provare.", author: "Yoda" },
    { text: "Quello che non ti uccide ti fortifica.", author: "Friedrich Nietzsche" },
    { text: "Il segreto per andare avanti è iniziare.", author: "Mark Twain" },
    { text: "Tutto ciò che puoi immaginare è reale.", author: "Pablo Picasso" },
    { text: "Non è mai troppo tardi per essere ciò che avresti potuto essere.", author: "George Eliot" },
    { text: "La vita è il 10% ciò che ti accade e il 90% come reagisci.", author: "Charles R. Swindoll" },
    { text: "Cadi sette volte, rialzati otto.", author: "Proverbio Giapponese" },
    { text: "Il successo è l'abilità di passare da un fallimento all'altro senza perdere l'entusiasmo.", author: "Winston Churchill" },
    { text: "L'unico vero errore è quello da cui non impariamo nulla.", author: "Henry Ford" },
    { text: "Se puoi sognarlo, puoi farlo.", author: "Walt Disney" },
    { text: "Fai una cosa ogni giorno che ti spaventa.", author: "Eleanor Roosevelt" },
    { text: "Il dubbio uccide più sogni di quanti il fallimento ne distruggerà mai.", author: "Suzy Kassem" },
    { text: "Chi ha un perché per vivere può sopportare quasi ogni come.", author: "Friedrich Nietzsche" },
    { text: "Non aspettare il momento giusto: crealo.", author: "George Bernard Shaw" },
    { text: "Non contare i giorni, fai in modo che i giorni contino.", author: "Muhammad Ali" }
];

export function initQuote() {
    const textEl = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');
    const refreshBtn = document.getElementById('quote-refresh-btn');

    function updateQuote() {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        textEl.textContent = `"${randomQuote.text}"`;
        authorEl.textContent = `- ${randomQuote.author}`;
    }

    // Inizializza con un aforisma casuale
    updateQuote();

    // Event listener per il tasto refresh
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // Aggiungi una piccola animazione di fade
            textEl.style.opacity = 0;
            authorEl.style.opacity = 0;
            setTimeout(() => {
                updateQuote();
                textEl.style.opacity = 1;
                authorEl.style.opacity = 1;
            }, 300);
        });
        
        // Imposta la transizione per il fade
        textEl.style.transition = 'opacity 0.3s ease';
        authorEl.style.transition = 'opacity 0.3s ease';
    }
}
