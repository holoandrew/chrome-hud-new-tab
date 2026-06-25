import { useState, useEffect } from 'react';

const QuoteWidget = () => {
  const [quote, setQuote] = useState('La logica vi porterà da A a B. L\'immaginazione vi porterà dappertutto.');
  const [author, setAuthor] = useState('Albert Einstein');

  const [fade, setFade] = useState(true);

  useEffect(() => {
    const quotes = [
      { q: "Il computer è la bicicletta della nostra mente.", a: "Steve Jobs" },
      { q: "La logica vi porterà da A a B. L'immaginazione vi porterà dappertutto.", a: "Albert Einstein" },
      { q: "Il miglior modo per predire il futuro è inventarlo.", a: "Alan Kay" },
      { q: "Il codice è poesia scritta per le macchine.", a: "Sconosciuto" },
      { q: "Semplicità è l'ultima sofisticazione.", a: "Leonardo da Vinci" },
      { q: "L'unico modo per fare un ottimo lavoro è amare quello che fate.", a: "Steve Jobs" }
    ];

    let currentIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[currentIndex].q);
    setAuthor(quotes[currentIndex].a);

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % quotes.length;
        setQuote(quotes[currentIndex].q);
        setAuthor(quotes[currentIndex].a);
        setFade(true);
      }, 500); // Wait for fade out
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#050b14]/80 border border-cyan-500/50 rounded-2xl p-4 md:p-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md">
      <h3 className="tech-text text-cyan-500 text-[10px] w-full text-left border-b border-cyan-500/20 pb-1 mb-3">INSPIRATION_SYS</h3>
      <div className={`transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-sm md:text-base text-cyan-50 italic mb-2 leading-relaxed">"{quote}"</p>
        <p className="text-xs text-cyan-500 text-right font-mono uppercase">- {author}</p>
      </div>
    </div>
  );
};

export default QuoteWidget;
