import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'theme-dark' | 'theme-dev' | 'theme-light' | 'theme-minimal';
export type BackgroundPreset = 'ironman' | 'minimal';

interface Settings {
  userName: string;
  theme: Theme;
  newsTopic: string;
  weatherCity: string;
  background: string | null;
  backgroundPreset: BackgroundPreset;
  bgOpacity: number;
  showWeather: boolean;
  showTasks: boolean;
  showSpotify: boolean;
  showQuote: boolean;
  showShortcuts: boolean;
  showNews: boolean;
  showGoogleServices: boolean;
  showGoogleSearch: boolean;
  enableDragDrop: boolean;
}

interface GlobalContextProps {
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  userName: 'Utente',
  theme: 'theme-dark',
  newsTopic: 'tecnologia',
  weatherCity: '',
  background: null,
  backgroundPreset: 'ironman',
  bgOpacity: 60,
  showWeather: true,
  showTasks: true,
  showSpotify: true,
  showQuote: true,
  showShortcuts: true,
  showNews: true,
  showGoogleServices: true,
  showGoogleSearch: true,
  enableDragDrop: true,
};

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('dashboard_settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('dashboard_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <GlobalContext.Provider value={{ isEditMode, setIsEditMode, settings, updateSettings }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within a GlobalProvider');
  return context;
};
