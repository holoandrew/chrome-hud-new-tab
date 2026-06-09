export async function initWeather() {
    const container = document.getElementById('weather-widget');
    
    // Coordinate di default (Roma)
    let lat = 41.8919;
    let lon = 12.5113;

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = position.coords.latitude;
        lon = position.coords.longitude;
    } catch (e) {
        // Usa Roma come default silenziosamente
    }

    try {
        const cityRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const cityData = await cityRes.json();
        const city = cityData.address.city || cityData.address.town || cityData.address.village || cityData.name || 'Sconosciuta';

        const weatherReq = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,relative_humidity_2m&daily=uv_index_max&hourly=temperature_2m,weathercode&timezone=auto`);
        const aqiReq = fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi`);

        const [wRes, aqiRes] = await Promise.all([weatherReq, aqiReq].map(p => p.catch(e => null)));
        
        let wData = null;
        let aqiData = null;
        if (wRes) wData = await wRes.json();
        if (aqiRes) aqiData = await aqiRes.json();
        
        if (wData && wData.current) {
            const temp = Math.round(wData.current.temperature_2m);
            const code = wData.current.weathercode;
            const humidity = wData.current.relative_humidity_2m || '--';
            const uv = (wData.daily && wData.daily.uv_index_max) ? wData.daily.uv_index_max[0] : '--';
            const aqi = (aqiData && aqiData.current) ? aqiData.current.european_aqi : '--';
            const icon = getWeatherIcon(code);
            
            let hourlyHtml = '';
            if (wData.hourly && wData.hourly.time) {
                hourlyHtml = '<div class="flex gap-2 mt-3 pt-3 border-t border-cyan-500/20 w-full justify-between">';
                const currentHourIndex = wData.hourly.time.findIndex(t => new Date(t) > new Date());
                for (let i = 0; i < 4; i++) {
                    const idx = Math.max(0, currentHourIndex + i);
                    if (idx < wData.hourly.time.length) {
                        const hTime = new Date(wData.hourly.time[idx]).getHours() + ':00';
                        const hTemp = Math.round(wData.hourly.temperature_2m[idx]);
                        const hIcon = getWeatherIcon(wData.hourly.weathercode[idx]);
                        hourlyHtml += `
                            <div class="flex flex-col items-center bg-[#0a1120]/50 rounded px-2 py-1 border border-cyan-500/10">
                                <span class="text-[10px] text-cyan-600 font-mono">${hTime}</span>
                                <span class="text-sm my-0.5">${hIcon}</span>
                                <span class="text-xs font-semibold text-cyan-200">${hTemp}°</span>
                            </div>
                        `;
                    }
                }
                hourlyHtml += '</div>';
            }

            container.innerHTML = `
                <div class="flex items-center justify-between w-full mb-1">
                    <span class="tech-text text-[10px] text-cyan-400 opacity-80">${city}</span>
                    <span class="text-3xl drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">${icon}</span>
                </div>
                <div class="flex items-end justify-between w-full mb-2">
                    <span class="text-4xl font-bold text-cyan-50 tracking-tighter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">${temp}°C</span>
                </div>
                <div class="flex w-full justify-between gap-4 text-[10px] text-cyan-300 tech-text opacity-90">
                    <div class="flex flex-col"><span>UMIDITÀ</span><span class="text-cyan-50 text-xs">${humidity}%</span></div>
                    <div class="flex flex-col"><span>UV MAX</span><span class="text-cyan-50 text-xs">${uv}</span></div>
                    <div class="flex flex-col"><span>AQI</span><span class="text-cyan-50 text-xs">${aqi}</span></div>
                </div>
                ${hourlyHtml}
            `;
        }
    } catch (e) {
        container.innerHTML = `<span class="tech-text text-red-400">ERRORE_CONNESSIONE</span>`;
    }
}

function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2 || code === 3) return '⛅';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 95) return '⛈️';
    return '🌡️';
}