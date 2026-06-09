let currentShortcuts = [];

export async function initShortcuts() {
    const container = document.getElementById('shortcuts-grid');
    const modal = document.getElementById('shortcut-modal');
    const closeBtn = document.getElementById('close-modal');
    const saveBtn = document.getElementById('save-modal');
    const nameInput = document.getElementById('shortcut-name');
    const urlInput = document.getElementById('shortcut-url');
    const idInput = document.getElementById('shortcut-id');
    const modalTitle = document.getElementById('shortcut-modal-title');
    const toggle = document.getElementById('edit-mode-toggle');
    
    if (toggle) {
        toggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('edit-mode-active');
            } else {
                document.body.classList.remove('edit-mode-active');
            }
        });
    }

    const storageGet = (key) => new Promise(resolve => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get([key], result => resolve(result[key]));
        } else {
            resolve(JSON.parse(localStorage.getItem(key)));
        }
    });

    const storageSet = (key, value) => new Promise(resolve => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ [key]: value }, resolve);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
            resolve();
        }
    });

    currentShortcuts = await storageGet('dashboard_shortcuts');
    if (!currentShortcuts || currentShortcuts.length === 0) {
        currentShortcuts = [
            { id: '1', name: 'Google', url: 'https://www.google.it', icon: 'https://www.google.com/favicon.ico' },
            { id: '2', name: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/favicon.ico' },
            { id: '3', name: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.svg' },
            { id: '4', name: 'Wikipedia', url: 'https://it.wikipedia.org', icon: 'https://it.wikipedia.org/favicon.ico' },
            { id: '5', name: 'Reddit', url: 'https://www.reddit.com', icon: 'https://www.redditstatic.com/favicon.ico' },
            { id: '6', name: 'X', url: 'https://x.com', icon: 'https://abs.twimg.com/favicons/twitter.3.ico' }
        ];
        await storageSet('dashboard_shortcuts', currentShortcuts);
    }

    const render = () => {
        container.innerHTML = '';
        
        currentShortcuts.forEach(sc => {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative group flex flex-col items-center justify-center gap-3 w-24 h-24 rounded-2xl transition duration-300 cursor-pointer';
            
            const a = document.createElement('a');
            a.href = sc.url;
            a.className = 'flex flex-col items-center w-full h-full justify-center cursor-pointer';
            a.onclick = (e) => {
                if (document.body.classList.contains('edit-mode-active')) {
                    e.preventDefault(); // Impedisce la navigazione se siamo in modalità modifica
                }
            };
            
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'w-12 h-12 bg-cyan-900/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-900/40 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300';
            
            const img = document.createElement('img');
            img.src = sc.icon;
            img.alt = sc.name;
            img.className = 'w-6 h-6 object-contain';
            if (sc.name.toLowerCase().includes('github') || sc.url.toLowerCase().includes('github.com')) {
                img.classList.add('invert', 'brightness-200');
            }
            img.onerror = () => {
                img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2306b6d4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
            };

            const span = document.createElement('span');
            span.className = 'text-xs font-medium text-cyan-500 group-hover:text-cyan-300 truncate w-full text-center px-1 mt-2';
            span.textContent = sc.name;

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.dataset.id = sc.id;
            delBtn.title = 'Elimina';
            delBtn.className = 'delete-sc absolute top-0 right-0 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full items-center justify-center transition-transform transform translate-x-2 -translate-y-2 shadow-lg z-10';
            delBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>';

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.dataset.id = sc.id;
            editBtn.title = 'Modifica';
            editBtn.className = 'edit-sc absolute top-0 left-0 w-6 h-6 bg-cyan-600 hover:bg-cyan-400 text-white rounded-full items-center justify-center transition-transform transform -translate-x-2 -translate-y-2 shadow-lg z-10';
            editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>';

            iconWrapper.appendChild(img);
            a.appendChild(iconWrapper);
            a.appendChild(span);
            wrapper.appendChild(a);
            wrapper.appendChild(delBtn);
            wrapper.appendChild(editBtn);
            container.appendChild(wrapper);
        });

        // Add "+" button
        const addBtn = document.createElement('button');
        addBtn.className = 'add-sc-btn group flex-col items-center justify-center gap-3 w-24 h-24 rounded-2xl transition duration-300 cursor-pointer';
        addBtn.innerHTML = `
            <div class="w-12 h-12 border border-dashed border-cyan-700 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-900/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-cyan-700 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </div>
            <span class="text-xs font-medium text-cyan-700 group-hover:text-cyan-400 truncate w-full text-center px-1">Aggiungi</span>
        `;
        addBtn.onclick = () => {
            idInput.value = '';
            nameInput.value = '';
            urlInput.value = '';
            modalTitle.textContent = 'NUOVA_SCORCIATOIA';
            modal.showModal();
        };
        container.appendChild(addBtn);
    };

    render();

    closeBtn.onclick = () => modal.close();
    
    saveBtn.onclick = async () => {
        const name = nameInput.value.trim();
        let url = urlInput.value.trim();
        const id = idInput.value;

        if (name && url) {
            if (!url.startsWith('http')) url = 'https://' + url;
            let icon = '';
            try {
                const newUrl = new URL(url);
                icon = newUrl.origin + '/favicon.ico';
            } catch(e) {
                icon = 'https://www.google.com/s2/favicons?domain=' + url;
            }
            
            if (id) {
                // Edit existing
                const index = currentShortcuts.findIndex(s => s.id === id);
                if (index !== -1) {
                    currentShortcuts[index] = { ...currentShortcuts[index], name, url, icon };
                }
            } else {
                // Add new
                currentShortcuts.push({
                    id: Date.now().toString(),
                    name,
                    url,
                    icon
                });
            }

            await storageSet('dashboard_shortcuts', currentShortcuts);
            render();
            modal.close();
        }
    };
    
    container.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-sc');
        const editBtn = e.target.closest('.edit-sc');
        
        if (deleteBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = deleteBtn.dataset.id;
            currentShortcuts = currentShortcuts.filter(s => s.id !== id);
            await storageSet('dashboard_shortcuts', currentShortcuts);
            render();
        }

        if (editBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = editBtn.dataset.id;
            const sc = currentShortcuts.find(s => s.id === id);
            if (sc) {
                idInput.value = sc.id;
                nameInput.value = sc.name;
                urlInput.value = sc.url;
                modalTitle.textContent = 'MODIFICA_SCORCIATOIA';
                modal.showModal();
            }
        }
    });
}
