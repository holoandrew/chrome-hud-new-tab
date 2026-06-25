import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useGlobal } from '../GlobalContext';

const GoogleServicesWidget = () => {
  const { isEditMode, settings } = useGlobal();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMode, setAiMode] = useState(() => localStorage.getItem('dashboard_ai_mode') !== '0');

  const toggleAiMode = () => {
    setAiMode((prev) => {
      const next = !prev;
      localStorage.setItem('dashboard_ai_mode', next ? '1' : '0');
      return next;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    // udm=50 = Google AI Mode. Richiede che sia abilitato per l'account/regione,
    // altrimenti Google ripiega sui risultati classici.
    const base = aiMode
      ? `https://www.google.com/search?udm=50&q=`
      : `https://www.google.com/search?q=`;
    window.open(base + encodeURIComponent(q), '_blank');
  };

  return (
    <div className={`w-full flex flex-col items-center gap-6 transition-opacity duration-300 ${isEditMode ? 'opacity-30 pointer-events-none' : ''}`}>
      {/* Ricerca Google */}
      {settings.showGoogleSearch && (
        <div className="w-full max-w-2xl px-4 xl:px-0">
          <div className="bg-[#050b14]/80 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md rounded-2xl p-2 flex items-center gap-2">
            <form onSubmit={handleSearch} className="w-full flex items-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="w-16 h-auto mx-4 opacity-80" alt="Google" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca su Google o digita un URL..." 
                className="w-full bg-transparent border-none text-cyan-50 focus:outline-none placeholder-cyan-500/50 text-lg py-3" 
              />
              <button
                type="button"
                onClick={toggleAiMode}
                aria-pressed={aiMode}
                title={aiMode ? 'AI Mode attivo' : 'AI Mode disattivo'}
                className={`flex items-center gap-1.5 px-3 py-1.5 mr-1 rounded-full border text-xs font-medium tech-text transition-all shrink-0 ${
                  aiMode
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-transparent border-cyan-500/20 text-cyan-600 hover:text-cyan-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI
              </button>
              <button type="submit" aria-label="Cerca" className="p-3 text-cyan-400 hover:text-cyan-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Google Apps */}
      <div className="w-full max-w-2xl flex justify-center gap-6 flex-wrap px-4 xl:px-0 mb-4">
        <a href="https://mail.google.com" title="Gmail" className="hover:scale-125 transition-transform drop-shadow-md">
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" className="w-6 h-6" alt="Gmail" />
        </a>
        <a href="https://drive.google.com" title="Drive" className="hover:scale-125 transition-transform drop-shadow-md">
          <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-6 h-6" alt="Drive" />
        </a>
        <a href="https://calendar.google.com" title="Calendar" className="hover:scale-125 transition-transform drop-shadow-md">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-6 h-6" alt="Calendar" />
        </a>
        <a href="https://maps.google.com" title="Maps" className="hover:scale-125 transition-transform drop-shadow-md">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" className="w-6 h-6" alt="Maps" />
        </a>
        <a href="https://translate.google.com" title="Translate" className="hover:scale-125 transition-transform drop-shadow-md">
          <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Translate_logo.svg" className="w-6 h-6" alt="Translate" />
        </a>
        <a href="https://docs.google.com/document" title="Documenti" className="hover:scale-125 transition-transform drop-shadow-md">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg" className="w-6 h-6" alt="Docs" />
        </a>
        <a href="https://docs.google.com/spreadsheets" title="Fogli" className="hover:scale-125 transition-transform drop-shadow-md">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" className="w-6 h-6" alt="Sheets" />
        </a>
        <a href="https://gemini.google.com" title="Gemini" className="hover:scale-125 transition-transform drop-shadow-md">
          <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" className="w-6 h-6" alt="Gemini" />
        </a>
      </div>
    </div>
  );
};

export default GoogleServicesWidget;
