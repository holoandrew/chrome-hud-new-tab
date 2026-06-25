import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useGlobal } from '../GlobalContext';

const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const { settings, updateSettings } = useGlobal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl p-6 rounded-2xl bg-[#050b14] border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl overflow-y-auto max-h-[90vh] custom-scrollbar"
      >
        <div className="flex items-center justify-between mb-6 border-b border-cyan-500/30 pb-2 shrink-0">
          <h3 className="text-cyan-300 font-bold text-lg tech-text">IMPOSTAZIONI_SISTEMA</h3>
          <button onClick={onClose} className="p-1 rounded-full text-cyan-600 hover:bg-cyan-900/50 hover:text-cyan-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-cyan-500 mb-1 font-mono">Nome Utente:</p>
              <input 
                type="text" 
                value={settings.userName}
                onChange={(e) => updateSettings({ userName: e.target.value })}
                placeholder="Es. Andrea" 
                className="w-full p-2 bg-[#0a1120] border border-cyan-500/30 rounded focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition text-cyan-100"
              />
            </div>
            
            <div>
              <p className="text-xs text-cyan-500 mb-1 font-mono">Categoria News:</p>
              <select 
                value={settings.newsTopic}
                onChange={(e) => updateSettings({ newsTopic: e.target.value })}
                className="w-full p-2 bg-[#0a1120] border border-cyan-500/30 rounded focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition text-cyan-100 tech-text"
              >
                <option value="finanza">FINANZA</option>
                <option value="tecnologia">TECNOLOGIA</option>
                <option value="italia">ITALIA</option>
                <option value="mondo">MONDO</option>
                <option value="sport24">SPORT</option>
              </select>
            </div>

            <div>
              <p className="text-xs text-cyan-500 mb-1 font-mono">Città Meteo (lascia vuoto per GPS):</p>
              <input 
                type="text" 
                value={settings.weatherCity}
                onChange={(e) => updateSettings({ weatherCity: e.target.value })}
                placeholder="Es. Milano, Roma..." 
                className="w-full p-2 bg-[#0a1120] border border-cyan-500/30 rounded focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition text-cyan-100"
              />
            </div>

            <div>
              <p className="text-xs text-cyan-500 mb-1 font-mono">Tema HUD:</p>
              <select 
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value as any })}
                className="w-full p-2 bg-[#0a1120] border border-cyan-500/30 rounded focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition text-cyan-100 tech-text"
              >
                <option value="theme-dark">DARK (CIANO / JARVIS)</option>
                <option value="theme-dev">DEV (VIOLA)</option>
                <option value="theme-light">LIGHT (GHIACCIO)</option>
                <option value="theme-minimal">MINIMAL (APEX-LIKE)</option>
              </select>
            </div>
            
            <div>
              <p className="text-xs text-cyan-500 mb-1 font-mono">Immagine Sfondo Globale:</p>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      updateSettings({ background: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full p-1.5 bg-[#0a1120] border border-cyan-500/30 rounded focus:outline-none text-cyan-100 text-xs"
              />
              <button 
                onClick={() => updateSettings({ background: null })}
                className="text-[10px] text-cyan-600 hover:text-cyan-400 mt-1 underline tech-text"
              >
                RIPRISTINA SFONDO DEFAULT
              </button>
            </div>

            <div>
              <p className="text-xs text-cyan-500 mb-1 font-mono flex justify-between">
                <span>Oscuramento Sfondo:</span>
                <span className="text-cyan-300">{settings.bgOpacity ?? 60}%</span>
              </p>
              <input 
                type="range" 
                min="0" 
                max="95" 
                step="5"
                value={settings.bgOpacity ?? 60}
                onChange={(e) => updateSettings({ bgOpacity: parseInt(e.target.value) })}
                className="w-full accent-cyan-500 mt-2"
              />
              <p className="text-[10px] text-cyan-700 mt-1 tech-text">AUMENTA PER MIGLIORARE LA LEGGIBILITÀ</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 mt-2 p-3 bg-[#0a1120] rounded border border-cyan-500/20">
            <h4 className="col-span-full text-xs text-cyan-500 font-mono border-b border-cyan-500/30 pb-1 mb-1">Visibilità Widget:</h4>
            
            {[
              { key: 'showGoogleSearch', label: 'Search Bar' },
              { key: 'showWeather', label: 'Meteo' },
              { key: 'showTasks', label: 'Tasks' },
              { key: 'showSpotify', label: 'Spotify' },
              { key: 'showQuote', label: 'Aforismi' },
              { key: 'showShortcuts', label: 'Scorciatoie' },
              { key: 'showNews', label: 'News' },
              { key: 'showGoogleServices', label: 'G Services' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-cyan-100 font-mono">{label}</span>
                <input 
                  type="checkbox" 
                  checked={(settings as any)[key]}
                  onChange={(e) => updateSettings({ [key]: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-500 bg-[#0a1120] border-cyan-500/50 focus:ring-cyan-500 cursor-pointer"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-500/50 rounded text-cyan-100 tech-text tracking-wider text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
            >
              SALVA CONFIGURAZIONE
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
