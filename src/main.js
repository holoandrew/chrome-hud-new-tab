import './style.css';
import { initTime } from './widgets/time.js';
import { initShortcuts } from './widgets/shortcuts.js';
import { initWeather } from './widgets/weather.js';
import { initQuote } from './widgets/quote.js';
import { initNews } from './widgets/news.js';
import { initSettings } from './widgets/settings.js';
import { initTasks } from './widgets/tasks.js';

const defaultBg = "bg-default.jpg";

document.addEventListener('DOMContentLoaded', () => {
    initTime();
    initShortcuts();
    initWeather();
    initQuote();
    initNews();
    initSettings();
    initTasks();
});
