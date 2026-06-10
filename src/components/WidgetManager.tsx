import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { GripHorizontal } from 'lucide-react';
import { useGlobal } from '../GlobalContext';

// Import Placeholder per i Widget (li implementeremo a breve)
import TimeWidget from './TimeWidget';
import WeatherWidget from './WeatherWidget';
import QuoteWidget from './QuoteWidget';
import NewsWidget from './NewsWidget';
import SpotifyWidget from './SpotifyWidget';
import TasksWidget from './TasksWidget';
import ShortcutsWidget from './ShortcutsWidget';
import GoogleServicesWidget from './GoogleServicesWidget';

interface Widget {
  id: string;
  type: string;
}

const WidgetManager = () => {
  const { isEditMode, settings } = useGlobal();
  const [leftCol, setLeftCol] = useState<Widget[]>([
    { id: 'w-spotify', type: 'spotify' },
    { id: 'w-news', type: 'news' }
  ]);
  const [rightCol, setRightCol] = useState<Widget[]>([
    { id: 'w-weather', type: 'weather' },
    { id: 'w-quote', type: 'quote' },
    { id: 'w-tasks', type: 'tasks' }
  ]);

  useEffect(() => {
    const savedLeft = localStorage.getItem('hud_layout_left');
    const savedRight = localStorage.getItem('hud_layout_right');
    if (savedLeft) setLeftCol(JSON.parse(savedLeft));
    if (savedRight) setRightCol(JSON.parse(savedRight));
  }, []);

  useEffect(() => {
    localStorage.setItem('hud_layout_left', JSON.stringify(leftCol));
    localStorage.setItem('hud_layout_right', JSON.stringify(rightCol));
  }, [leftCol, rightCol]);

  const renderWidget = (type: string) => {
    switch (type) {
      case 'weather': return settings.showWeather ? <WeatherWidget /> : null;
      case 'quote': return settings.showQuote ? <QuoteWidget /> : null;
      case 'news': return settings.showNews ? <NewsWidget /> : null;
      case 'spotify': return settings.showSpotify ? <SpotifyWidget /> : null;
      case 'tasks': return settings.showTasks ? <TasksWidget /> : null;
      default: return null;
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row justify-between gap-6 xl:gap-8 px-0 xl:px-4 pt-20 md:pt-24 pb-6 md:p-8 md:pt-24 xl:p-12 xl:pt-24 relative z-10 transition-all duration-500 min-h-[80vh]">
      
      {/* LEFT COLUMN */}
      <div className={`w-full xl:w-[320px] flex-shrink-0 flex flex-col gap-4 transition-all duration-300 ${isEditMode && leftCol.length === 0 ? 'bg-cyan-900/10 border-2 border-dashed border-cyan-500/30 rounded-2xl p-4' : ''}`}>
        <ReactSortable
          group="widgets"
          list={leftCol}
          setList={setLeftCol}
          animation={200}
          disabled={!isEditMode}
          handle=".widget-drag-handle"
          className="w-full flex flex-col gap-4 min-h-[100px]"
        >
          {leftCol.map(w => {
            const content = renderWidget(w.type);
            if (!content) return <div key={w.id} className="hidden"></div>;
            return (
              <div key={w.id} className="w-full relative group transition-all duration-300">
                {isEditMode && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-cyan-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="widget-drag-handle cursor-grab active:cursor-grabbing p-1 text-cyan-400 hover:text-white">
                      <GripHorizontal className="w-4 h-4" />
                    </div>
                  </div>
                )}
                <div className={`w-full ${isEditMode ? 'ring-2 ring-cyan-500/50 rounded-2xl p-2' : ''}`}>
                  {content}
                </div>
              </div>
            );
          })}
        </ReactSortable>
      </div>

      {/* CENTER COLUMN (Fixed widgets like Time and Shortcuts) */}
      <div className="flex-grow flex flex-col items-center justify-start gap-6 z-10 w-full xl:w-auto max-w-4xl 2xl:max-w-5xl mx-auto">
        <TimeWidget />
        {settings.showGoogleServices && <GoogleServicesWidget />}
        {settings.showShortcuts && <ShortcutsWidget />}
      </div>

      {/* RIGHT COLUMN */}
      <div className={`w-full xl:w-[320px] flex-shrink-0 flex flex-col gap-4 transition-all duration-300 ${isEditMode && rightCol.length === 0 ? 'bg-cyan-900/10 border-2 border-dashed border-cyan-500/30 rounded-2xl p-4' : ''}`}>
        <ReactSortable
          group="widgets"
          list={rightCol}
          setList={setRightCol}
          animation={200}
          disabled={!isEditMode}
          handle=".widget-drag-handle"
          className="w-full flex flex-col gap-4 min-h-[100px]"
        >
          {rightCol.map(w => {
            const content = renderWidget(w.type);
            if (!content) return <div key={w.id} className="hidden"></div>;
            return (
              <div key={w.id} className="w-full relative group transition-all duration-300">
                {isEditMode && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-cyan-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="widget-drag-handle cursor-grab active:cursor-grabbing p-1 text-cyan-400 hover:text-white">
                      <GripHorizontal className="w-4 h-4" />
                    </div>
                  </div>
                )}
                <div className={`w-full ${isEditMode ? 'ring-2 ring-cyan-500/50 rounded-2xl p-2' : ''}`}>
                  {content}
                </div>
              </div>
            );
          })}
        </ReactSortable>
      </div>

    </div>
  );
};

export default WidgetManager;
