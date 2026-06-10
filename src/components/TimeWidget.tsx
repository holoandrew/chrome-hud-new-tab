import React, { useState, useEffect } from 'react';
import { useGlobal } from '../GlobalContext';

const TimeWidget = () => {
  const { settings } = useGlobal();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-0 my-1 md:my-2">
      <h2 className="text-base md:text-lg font-mono text-cyan-400/80 uppercase tracking-widest tech-text">BENTORNATO, {settings.userName.toUpperCase()}</h2>
      <h1 className="text-5xl md:text-7xl font-bold text-cyan-50 tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] leading-none my-1">{formatTime(time)}</h1>
      <p className="text-xs md:text-sm font-mono text-cyan-500 uppercase tracking-widest">{formatDate(time)}</p>
    </div>
  );
};

export default TimeWidget;
