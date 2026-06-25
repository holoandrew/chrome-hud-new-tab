import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { GripHorizontal } from 'lucide-react';
import { useGlobal } from '../GlobalContext';
import ErrorBoundary from './ErrorBoundary';

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

const DEFAULT_LEFT: Widget[] = [
  { id: 'w-spotify', type: 'spotify' },
  { id: 'w-news', type: 'news' },
];
const DEFAULT_RIGHT: Widget[] = [
  { id: 'w-weather', type: 'weather' },
  { id: 'w-quote', type: 'quote' },
  { id: 'w-tasks', type: 'tasks' },
];

// Riconcilia il layout salvato con i default: scarta widget rimossi e
// appende quelli nuovi non ancora presenti in nessuna colonna salvata.
const reconcile = (saved: Widget[], known: Widget[], otherSaved: Widget[]): Widget[] => {
  const knownTypes = new Set(known.map((w) => w.type));
  const present = new Set([...saved, ...otherSaved].map((w) => w.type));
  const kept = saved.filter((w) => knownTypes.has(w.type));
  const added = known.filter((w) => !present.has(w.type));
  return [...kept, ...added];
};

const loadColumn = (key: string, def: Widget[], other: Widget[]): Widget[] => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return def;
    return reconcile(JSON.parse(saved) as Widget[], def, other);
  } catch {
    return def;
  }
};

const WidgetColumn = ({
  list,
  setList,
  renderWidget,
  side,
}: {
  list: Widget[];
  setList: (w: Widget[]) => void;
  renderWidget: (type: string) => React.ReactNode;
  side: string;
}) => {
  const { isEditMode, settings } = useGlobal();
  return (
    <div
      className={`order-3 md:col-span-1 w-full xl:w-[320px] flex-shrink-0 flex flex-col gap-4 xl:pt-10 transition-all duration-300 ${side} ${
        isEditMode && list.length === 0
          ? 'bg-cyan-900/10 border-2 border-dashed border-cyan-500/30 rounded-2xl p-4'
          : ''
      }`}
    >
      <ReactSortable
        group="widgets"
        list={list}
        setList={setList}
        animation={200}
        disabled={!isEditMode || !settings.enableDragDrop}
        handle=".widget-drag-handle"
        className="w-full flex flex-col gap-4 min-h-[100px]"
      >
        {list.map((w) => {
          const content = renderWidget(w.type);
          if (!content) return <div key={w.id} className="hidden"></div>;
          return (
            <div key={w.id} className="w-full relative group transition-all duration-300">
              {isEditMode && settings.enableDragDrop && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-cyan-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className="widget-drag-handle cursor-grab active:cursor-grabbing p-1 text-cyan-400 hover:text-white"
                    aria-label="Sposta widget"
                  >
                    <GripHorizontal className="w-4 h-4" />
                  </div>
                </div>
              )}
              <div className={`w-full ${isEditMode ? 'ring-2 ring-cyan-500/50 rounded-2xl p-2' : ''}`}>
                <ErrorBoundary label={w.type}>{content}</ErrorBoundary>
              </div>
            </div>
          );
        })}
      </ReactSortable>
    </div>
  );
};

const WidgetManager = () => {
  const { settings } = useGlobal();
  const [leftCol, setLeftCol] = useState<Widget[]>(() =>
    loadColumn('hud_layout_left', DEFAULT_LEFT, DEFAULT_RIGHT)
  );
  const [rightCol, setRightCol] = useState<Widget[]>(() =>
    loadColumn('hud_layout_right', DEFAULT_RIGHT, DEFAULT_LEFT)
  );

  useEffect(() => {
    localStorage.setItem('hud_layout_left', JSON.stringify(leftCol));
    localStorage.setItem('hud_layout_right', JSON.stringify(rightCol));
  }, [leftCol, rightCol]);

  const renderWidget = (type: string): React.ReactNode => {
    switch (type) {
      case 'weather':
        return settings.showWeather ? <WeatherWidget /> : null;
      case 'quote':
        return settings.showQuote ? <QuoteWidget /> : null;
      case 'news':
        return settings.showNews ? <NewsWidget /> : null;
      case 'spotify':
        return settings.showSpotify ? <SpotifyWidget /> : null;
      case 'tasks':
        return settings.showTasks ? <TasksWidget /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:flex xl:flex-row justify-between gap-6 xl:gap-8 px-0 md:px-8 xl:px-4 pt-16 md:pt-16 pb-6 md:pb-8 xl:p-12 xl:pt-16 relative z-10 transition-all duration-500 min-h-[80vh]">
      <WidgetColumn
        list={leftCol}
        setList={setLeftCol}
        renderWidget={renderWidget}
        side="order-2 xl:order-1"
      />

      {/* CENTER COLUMN (Fixed widgets like Time and Shortcuts) */}
      <div className="order-1 md:col-span-2 xl:order-2 flex-grow flex flex-col items-center justify-start gap-4 z-10 w-full xl:w-auto max-w-4xl 2xl:max-w-5xl mx-auto">
        <ErrorBoundary label="time">
          <TimeWidget />
        </ErrorBoundary>
        {settings.showGoogleServices && (
          <ErrorBoundary label="google-services">
            <GoogleServicesWidget />
          </ErrorBoundary>
        )}
        {settings.showShortcuts && (
          <ErrorBoundary label="shortcuts">
            <ShortcutsWidget />
          </ErrorBoundary>
        )}
      </div>

      <WidgetColumn
        list={rightCol}
        setList={setRightCol}
        renderWidget={renderWidget}
        side="order-3 xl:order-3"
      />
    </div>
  );
};

export default WidgetManager;
