import React, { useState, useEffect } from 'react';
import { useGlobal } from '../GlobalContext';

interface HourlyData {
  time: string;
  temp: number;
  icon: string;
}

const WeatherWidget = () => {
  const { isEditMode, settings } = useGlobal();
  const [city, setCity] = useState('Sconosciuta');
  const [temp, setTemp] = useState('--');
  const [humidity, setHumidity] = useState('--');
  const [uv, setUv] = useState('--');
  const [aqi, setAqi] = useState('--');
  const [icon, setIcon] = useState('🌡️');
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2 || code === 3) return '⛅';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 95) return '⛈️';
    return '🌡️';
  };

  /** Fetch tramite background service worker (bypassa CORS) */
  const swFetch = async (url: string): Promise<any> => {
    const response: { ok: boolean; data?: string; error?: string } = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'FETCH_URL', url }, resolve);
    });
    if (!response?.ok || !response.data) {
      throw new Error(response?.error || 'Fetch failed');
    }
    return JSON.parse(response.data);
  };

  const fetchWeather = async (retries = 2) => {
    setLoading(true);
    setError(false);
    let lat = 41.8919;
    let lon = 12.5113;
    let cityName = 'Roma';

    try {
      if (settings.weatherCity && settings.weatherCity.trim() !== '') {
        const geoData = await swFetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(settings.weatherCity)}`);
        if (geoData && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lon = parseFloat(geoData[0].lon);
          cityName = geoData[0].name;
        }
      } else {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        
        const cityData = await swFetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        cityName = cityData.address?.city || cityData.address?.town || cityData.address?.village || cityData.name || 'Sconosciuta';
      }
    } catch (e) {
      // Fallback to Rome defaults
    }

    setCity(cityName);

    try {
      const [wData, aqiData] = await Promise.all([
        swFetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,relative_humidity_2m&daily=uv_index_max&hourly=temperature_2m,weathercode&timezone=auto`),
        swFetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi`).catch(() => null)
      ]);

      if (wData && wData.current) {
        setTemp(Math.round(wData.current.temperature_2m).toString());
        setIcon(getWeatherIcon(wData.current.weathercode));
        setHumidity((wData.current.relative_humidity_2m || '--').toString());
        setUv((wData.daily && wData.daily.uv_index_max ? wData.daily.uv_index_max[0] : '--').toString());
        setAqi((aqiData && aqiData.current ? aqiData.current.european_aqi : '--').toString());

        if (wData.hourly && wData.hourly.time) {
          const currentHourIndex = wData.hourly.time.findIndex((t: string) => new Date(t) > new Date());
          const hours = [];
          for (let i = 0; i < 4; i++) {
            const idx = Math.max(0, currentHourIndex + i);
            if (idx < wData.hourly.time.length) {
              hours.push({
                time: new Date(wData.hourly.time[idx]).getHours() + ':00',
                temp: Math.round(wData.hourly.temperature_2m[idx]),
                icon: getWeatherIcon(wData.hourly.weathercode[idx])
              });
            }
          }
          setHourly(hours);
        }
        setError(false);
      } else {
        throw new Error('Dati meteo non disponibili');
      }
    } catch (e) {
      if (retries > 0) {
        console.warn(`Meteo: tentativo fallito, riprovo... (${retries} rimasti)`);
        await new Promise((r) => setTimeout(r, 2000));
        return fetchWeather(retries - 1);
      }
      console.error('Meteo: tutti i tentativi falliti', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [settings.weatherCity]);

  return (
    <div className={`glass-panel w-full md:w-[320px] flex flex-col overflow-hidden self-center xl:self-end transition-opacity duration-300 ${isEditMode ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="px-4 py-2 border-b border-cyan-500/20 shrink-0 bg-[#050b14]/40 flex justify-between items-center">
        <h2 className="tech-text text-[10px] text-cyan-50">METEO <span className="text-cyan-700">//</span> ONLINE</h2>
      </div>
      
      <div className="px-5 py-3 flex flex-col items-end gap-2 w-full">
        {loading ? (
          <div className="animate-pulse w-full h-16 bg-cyan-900/50 rounded"></div>
        ) : error ? (
          <div className="w-full flex flex-col items-center gap-3 py-4">
            <span className="text-cyan-600 text-xs tech-text">CONNESSIONE_FALLITA</span>
            <button
              onClick={() => fetchWeather()}
              className="px-4 py-1.5 text-[10px] tech-text text-cyan-300 border border-cyan-500/40 rounded hover:bg-cyan-900/40 hover:border-cyan-400 transition-all"
            >
              ↻ RIPROVA
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="tech-text text-[10px] text-cyan-400 opacity-80">{city}</span>
              <span className="text-3xl drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] no-hue">{icon}</span>
            </div>
            
            <div className="flex items-end justify-between w-full mb-2">
              <span className="text-4xl font-bold text-cyan-50 tracking-tighter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">{temp}°C</span>
            </div>

            <div className="flex w-full justify-between gap-4 text-[10px] text-cyan-300 tech-text opacity-90">
              <div className="flex flex-col"><span>UMIDITÀ</span><span className="text-cyan-50 text-xs">{humidity}%</span></div>
              <div className="flex flex-col"><span>UV MAX</span><span className="text-cyan-50 text-xs">{uv}</span></div>
              <div className="flex flex-col"><span>AQI</span><span className="text-cyan-50 text-xs">{aqi}</span></div>
            </div>

            {hourly.length > 0 && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-cyan-500/20 w-full justify-between">
                {hourly.map((h, i) => (
                  <div key={i} className="flex flex-col items-center bg-[#0a1120]/50 rounded px-2 py-1 border border-cyan-500/10">
                    <span className="text-[10px] text-cyan-600 font-mono">{h.time}</span>
                    <span className="text-sm my-0.5 no-hue">{h.icon}</span>
                    <span className="text-xs font-semibold text-cyan-200">{h.temp}°</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;
