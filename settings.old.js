export async function initSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('close-settings-modal');
    const saveBtn = document.getElementById('save-settings-modal');
    
    const nameInput = document.getElementById('user-name-input');
    const newsTopicInput = document.getElementById('news-topic-input');
    const bgFileInput = document.getElementById('bg-file-input');
    const resetBgBtn = document.getElementById('reset-bg-btn');
    const greetingDisplay = document.getElementById('greeting-display');
    const themeInput = document.getElementById('theme-input');
    const spotifyToggleInput = document.getElementById('spotify-toggle-input');
    const spotifyContainer = document.getElementById('spotify-widget-container');
    const newsToggleInput = document.getElementById('news-toggle-input');
    const newsContainer = document.getElementById('news-widget');
    const quoteToggleInput = document.getElementById('quote-toggle-input');
    const quoteContainer = document.getElementById('quote-widget');
    const weatherToggleInput = document.getElementById('weather-toggle-input');
    const weatherContainer = document.getElementById('weather-widget-container');

    const storageGet = (key) => new Promise(resolve => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get([key], result => resolve(result[key]));
        } else {
            resolve(localStorage.getItem(key));
        }
    });

    const storageSet = (key, value) => new Promise(resolve => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ [key]: value }, resolve);
        } else {
            if (value) localStorage.setItem(key, value);
            else localStorage.removeItem(key);
            resolve();
        }
    });

    // Load initial settings
    const savedName = await storageGet('dashboard_name') || 'Utente';
    greetingDisplay.textContent = `Ciao ${savedName}!`;
    
    const savedBg = await storageGet('dashboard_bg');
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
    } else {
        document.body.style.backgroundImage = `url('bg-default.jpg')`;
    }

    // Load Theme
    const savedTheme = await storageGet('dashboard_theme') || 'theme-dark';
    document.body.className = document.body.className.replace(/theme-\w+/g, ''); // rimuovi temi vecchi
    document.body.classList.add(savedTheme);

    // Load Spotify
    let savedSpotify = await storageGet('dashboard_spotify_enabled');
    if (savedSpotify === undefined || savedSpotify === null) savedSpotify = true; // default true
    if (spotifyContainer) {
        spotifyContainer.style.display = savedSpotify ? 'flex' : 'none';
    }

    // Load News
    let savedNews = await storageGet('dashboard_news_enabled');
    if (savedNews === undefined || savedNews === null) savedNews = true;
    if (newsContainer) {
        newsContainer.style.display = savedNews ? 'flex' : 'none';
    }

    // Load Quote
    let savedQuote = await storageGet('dashboard_quote_enabled');
    if (savedQuote === undefined || savedQuote === null) savedQuote = true;
    if (quoteContainer) {
        quoteContainer.style.display = savedQuote ? 'flex' : 'none';
    }

    // Load Weather
    let savedWeather = await storageGet('dashboard_weather_enabled');
    if (savedWeather === undefined || savedWeather === null) savedWeather = true;
    if (weatherContainer) {
        weatherContainer.style.display = savedWeather ? 'flex' : 'none';
    }

    if (settingsBtn) {
        settingsBtn.onclick = async () => {
            nameInput.value = await storageGet('dashboard_name') || '';
            const savedTopic = await storageGet('dashboard_news_topic') || 'finanza';
            if (newsTopicInput) newsTopicInput.value = savedTopic;
            
            const savedTheme = await storageGet('dashboard_theme') || 'theme-dark';
            if (themeInput) themeInput.value = savedTheme;

            let savedSpotify = await storageGet('dashboard_spotify_enabled');
            if (savedSpotify === undefined || savedSpotify === null) savedSpotify = true;
            if (spotifyToggleInput) spotifyToggleInput.checked = savedSpotify;

            let savedNews = await storageGet('dashboard_news_enabled');
            if (savedNews === undefined || savedNews === null) savedNews = true;
            if (newsToggleInput) newsToggleInput.checked = savedNews;

            let savedQuote = await storageGet('dashboard_quote_enabled');
            if (savedQuote === undefined || savedQuote === null) savedQuote = true;
            if (quoteToggleInput) quoteToggleInput.checked = savedQuote;

            let savedWeather = await storageGet('dashboard_weather_enabled');
            if (savedWeather === undefined || savedWeather === null) savedWeather = true;
            if (weatherToggleInput) weatherToggleInput.checked = savedWeather;

            if (bgFileInput) bgFileInput.value = '';
            modal.showModal();
        };
    }

    if (resetBgBtn) {
        resetBgBtn.onclick = async () => {
            await storageSet('dashboard_bg', null);
            document.body.style.backgroundImage = `url('bg-default.jpg')`;
            if (bgFileInput) bgFileInput.value = '';
            modal.close();
        };
    }

    if (closeBtn) closeBtn.onclick = () => modal.close();

    if (saveBtn) {
        saveBtn.onclick = async () => {
            // Name
            const name = nameInput.value.trim();
            await storageSet('dashboard_name', name);
            greetingDisplay.textContent = `Ciao ${name || 'Utente'}!`;

            // News Topic
            if (newsTopicInput) {
                await storageSet('dashboard_news_topic', newsTopicInput.value);
            }

            // Theme
            if (themeInput) {
                const newTheme = themeInput.value;
                await storageSet('dashboard_theme', newTheme);
                document.body.className = document.body.className.replace(/theme-\w+/g, '');
                document.body.classList.add(newTheme);
            }

            // Spotify
            if (spotifyToggleInput) {
                const isEnabled = spotifyToggleInput.checked;
                await storageSet('dashboard_spotify_enabled', isEnabled);
                if (spotifyContainer) {
                    spotifyContainer.style.display = isEnabled ? 'flex' : 'none';
                }
            }

            // News
            if (newsToggleInput) {
                const isEnabled = newsToggleInput.checked;
                await storageSet('dashboard_news_enabled', isEnabled);
                if (newsContainer) {
                    newsContainer.style.display = isEnabled ? 'flex' : 'none';
                }
            }

            // Quote
            if (quoteToggleInput) {
                const isEnabled = quoteToggleInput.checked;
                await storageSet('dashboard_quote_enabled', isEnabled);
                if (quoteContainer) {
                    quoteContainer.style.display = isEnabled ? 'flex' : 'none';
                }
            }

            // Weather
            if (weatherToggleInput) {
                const isEnabled = weatherToggleInput.checked;
                await storageSet('dashboard_weather_enabled', isEnabled);
                if (weatherContainer) {
                    weatherContainer.style.display = isEnabled ? 'flex' : 'none';
                }
            }

            // Background
            if (bgFileInput.files && bgFileInput.files[0]) {
                const file = bgFileInput.files[0];
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64String = reader.result;
                    await storageSet('dashboard_bg', base64String);
                    document.body.style.backgroundImage = `url('${base64String}')`;
                    modal.close();
                    window.location.reload(); // Reload to apply news topic
                };
                reader.readAsDataURL(file);
            } else {
                // If no new bg file, just close and reload to apply other settings like news
                modal.close();
                window.location.reload();
            }
        };
    }
}
