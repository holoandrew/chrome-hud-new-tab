export async function initBackground() {
    const setBgBtn = document.getElementById('set-bg-btn');
    const modal = document.getElementById('bg-modal');
    const closeBtn = document.getElementById('close-bg-modal');
    const saveBtn = document.getElementById('save-bg-modal');
    const urlInput = document.getElementById('bg-url');

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

    const savedBg = await storageGet('dashboard_bg');
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
    }

    if (setBgBtn) {
        setBgBtn.onclick = () => {
            urlInput.value = savedBg || '';
            modal.showModal();
        };
    }

    if (closeBtn) closeBtn.onclick = () => modal.close();

    if (saveBtn) {
        saveBtn.onclick = async () => {
            const url = urlInput.value.trim();
            await storageSet('dashboard_bg', url);
            if (url) {
                document.body.style.backgroundImage = `url('${url}')`;
            } else {
                // Remove custom image, fallback to CSS gradient
                document.body.style.backgroundImage = '';
            }
            modal.close();
        };
    }
}
