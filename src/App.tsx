import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Settings } from 'lucide-react';
import { useGlobal } from './GlobalContext';
import WidgetManager from './components/WidgetManager';
import SettingsModal from './components/SettingsModal';

function App() {
  const { isEditMode, setIsEditMode, settings } = useGlobal();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    document.body.classList.remove('theme-dark', 'theme-dev', 'theme-light', 'theme-minimal');
    if (settings.theme) {
      document.body.classList.add(settings.theme);
    }
  }, [settings.theme]);

  const customBgStyle = settings.background ? { backgroundImage: `url(${settings.background})` } : { backgroundImage: `url('/bg-default.jpg')` };

  return (
    <div className={`min-h-screen w-full relative overflow-x-hidden md:overflow-hidden bg-cover bg-center bg-no-repeat font-sans flex flex-col p-4 md:p-0 gap-6 md:block ${settings.theme}`} style={customBgStyle}>
      
      {/* Dark overlay for better readability based on theme */}
      <div 
        className="fixed inset-0 z-[1] pointer-events-none transition-colors duration-500" 
        style={{ 
          backgroundColor: `rgba(${settings.theme === 'theme-minimal' || settings.theme === 'theme-light' ? '255, 255, 255' : '5, 11, 20'}, ${(settings.bgOpacity ?? 60) / 100})` 
        }}
      ></div>

      {/* Top Right Actions */}
      <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50 flex items-center gap-4">
        <motion.button
          onClick={() => setIsSettingsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center p-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 backdrop-blur-md rounded-full text-cyan-100 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] group"
          title="Impostazioni"
        >
          <Settings className="w-5 h-5 text-cyan-400 group-hover:text-cyan-200 transition-colors" />
        </motion.button>
        <motion.button
          onClick={() => setIsEditMode(!isEditMode)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center p-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 border backdrop-blur-md rounded-full transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] group ${isEditMode ? 'border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'border-cyan-800/50 text-cyan-100 hover:text-white'}`}
          title={isEditMode ? "Fine Modifiche" : "Layout Widget"}
        >
          <LayoutDashboard className={`w-5 h-5 ${isEditMode ? 'text-amber-400' : 'text-cyan-400 group-hover:text-cyan-200'} transition-colors`} />
        </motion.button>
      </div>

      {/* MAIN WRAPPER */}
      <div id="ui-layer" className="relative z-10 w-full h-full min-h-screen flex flex-col xl:flex-row xl:justify-between items-stretch gap-4 pb-24 transition-all duration-500">
        <WidgetManager />
      </div>

      {/* Global Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      </AnimatePresence>

    </div>
  );
}

export default App;
