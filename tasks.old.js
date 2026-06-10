let currentListId = null;
let authToken = null;
let currentTab = 'active';
let allTasks = [];

export async function initTasks() {
    const authContainer = document.getElementById('tasks-auth-container');
    const mainContainer = document.getElementById('tasks-main-container');
    const loginBtn = document.getElementById('tasks-login-btn');
    const addForm = document.getElementById('tasks-add-form');
    const addInput = document.getElementById('tasks-add-input');
    const statusIndicator = document.getElementById('tasks-status-indicator');
    const tabActive = document.getElementById('tab-active');
    const tabCompleted = document.getElementById('tab-completed');
    const micBtn = document.getElementById('tasks-mic-btn');
    const header = document.getElementById('tasks-header');
    const toggleIcon = document.getElementById('tasks-toggle-icon');

    // Accordion Toggle Logic
    let isCollapsed = false;
    header.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            mainContainer.style.display = 'none';
            toggleIcon.classList.add('-rotate-90');
        } else {
            mainContainer.style.display = 'flex';
            toggleIcon.classList.remove('-rotate-90');
        }
    });

    // Attempt silent auth
    try {
        const token = await getAuthToken(false);
        if (token) {
            handleLoginSuccess(token);
        }
    } catch (e) {
        // Not logged in or error, show auth container
        authContainer.classList.remove('hidden');
        mainContainer.classList.add('hidden');
    }

    // Tabs logic
    tabActive.addEventListener('click', () => {
        currentTab = 'active';
        tabActive.className = 'text-[10px] tech-text text-cyan-300 border-b border-cyan-300 pb-0.5';
        tabCompleted.className = 'text-[10px] tech-text text-cyan-700 hover:text-cyan-500 transition-colors pb-0.5';
        renderTasks(allTasks);
    });

    tabCompleted.addEventListener('click', () => {
        currentTab = 'completed';
        tabCompleted.className = 'text-[10px] tech-text text-cyan-300 border-b border-cyan-300 pb-0.5';
        tabActive.className = 'text-[10px] tech-text text-cyan-700 hover:text-cyan-500 transition-colors pb-0.5';
        renderTasks(allTasks);
    });

    // Mic Logic (Web Speech API)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'it-IT';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        micBtn.addEventListener('click', () => {
            micBtn.classList.add('text-cyan-300', 'animate-pulse');
            recognition.start();
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            addInput.value = transcript;
            addInput.focus();
            micBtn.classList.remove('text-cyan-300', 'animate-pulse');
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            micBtn.classList.remove('text-cyan-300', 'animate-pulse');
        };
        
        recognition.onend = () => {
            micBtn.classList.remove('text-cyan-300', 'animate-pulse');
        };
    } else {
        micBtn.style.display = 'none';
    }

    loginBtn.addEventListener('click', async () => {
        console.log('Button AUTH_REQ cliccato. Richiesta token in corso...');
        try {
            const token = await getAuthToken(true);
            console.log('Token ottenuto con successo:', token ? 'SI' : 'NO');
            if (token) {
                await handleLoginSuccess(token);
            }
        } catch (e) {
            console.error('Task login error:', e);
            alert('Autenticazione fallita. Controlla la console per i dettagli esatti.');
        }
    });

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = addInput.value.trim();
        if (!title || !currentListId || !authToken) return;
        
        addInput.disabled = true;
        try {
            await addTask(currentListId, title, authToken);
            addInput.value = '';
            await loadAndRenderTasks();
        } catch (err) {
            console.error('Error adding task', err);
        } finally {
            addInput.disabled = false;
            addInput.focus();
        }
    });

    async function handleLoginSuccess(token) {
        authToken = token;
        authContainer.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        mainContainer.classList.add('flex');
        statusIndicator.classList.replace('bg-cyan-700', 'bg-green-500');

        await loadAndRenderTasks();
    }

    async function loadAndRenderTasks() {
        try {
            if (!currentListId) {
                const lists = await fetchLists(authToken);
                if (lists.items && lists.items.length > 0) {
                    currentListId = lists.items[0].id; // Use default list
                } else {
                    return;
                }
            }
            const tasksData = await fetchTasks(currentListId, authToken);
            allTasks = tasksData.items || [];
            renderTasks(allTasks);
        } catch (e) {
            console.error('Failed to load tasks', e);
            if (e.message && e.message.includes('401')) {
                // Token expired
                chrome.identity.removeCachedAuthToken({ token: authToken }, () => {
                    initTasks(); // re-init
                });
            }
        }
    }
}

function getAuthToken(interactive) {
    return new Promise((resolve, reject) => {
        if (typeof chrome === 'undefined' || !chrome.identity) {
            reject(new Error('chrome.identity API not available'));
            return;
        }
        chrome.identity.getAuthToken({ interactive }, (token) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(token);
            }
        });
    });
}

async function fetchLists(token) {
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Failed to fetch task lists: ' + res.status);
    return res.json();
}

async function fetchTasks(listId, token) {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Failed to fetch tasks: ' + res.status);
    return res.json();
}

async function addTask(listId, title, token) {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error('Failed to add task: ' + res.status);
    return res.json();
}

async function completeTask(listId, taskId, token) {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
    });
    if (!res.ok) throw new Error('Failed to complete task: ' + res.status);
    return res.json();
}

function renderTasks(tasks) {
    const listEl = document.getElementById('tasks-list');
    listEl.innerHTML = '';

    const filteredTasks = tasks.filter(t => currentTab === 'active' ? t.status === 'needsAction' : t.status === 'completed');

    if (filteredTasks.length === 0) {
        listEl.innerHTML = currentTab === 'active' 
            ? '<p class="text-[10px] text-cyan-700 text-center italic mt-4">Nessun task in sospeso.</p>'
            : '<p class="text-[10px] text-cyan-700 text-center italic mt-4">Nessun task completato.</p>';
        return;
    }

    filteredTasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'group flex items-start gap-2 p-2 hover:bg-cyan-900/20 rounded transition-colors cursor-pointer';
        
        const checkbox = document.createElement('div');
        checkbox.className = 'w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ' + 
            (task.status === 'completed' ? 'border-cyan-300' : 'border-cyan-500/50 group-hover:border-cyan-300');
        
        if (task.status === 'completed') {
            checkbox.innerHTML = '<svg class="w-3 h-3 text-cyan-300" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
        } else {
            checkbox.innerHTML = '<svg class="w-3 h-3 text-cyan-300 opacity-0 group-hover:opacity-50 transition-opacity" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
        }

        const text = document.createElement('span');
        text.className = 'text-xs font-medium leading-snug ' + (task.status === 'completed' ? 'text-cyan-700 line-through' : 'text-cyan-100');
        text.textContent = task.title;

        div.appendChild(checkbox);
        div.appendChild(text);

        if (task.status !== 'completed') {
            div.addEventListener('click', async () => {
                // Animazione completamento rapida lato client
                checkbox.innerHTML = '<svg class="w-3 h-3 text-cyan-300" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
                text.classList.replace('text-cyan-100', 'text-cyan-700');
                text.classList.add('line-through');
                div.style.pointerEvents = 'none';

                try {
                    await completeTask(currentListId, task.id, authToken);
                    task.status = 'completed';
                    div.style.transition = 'opacity 0.3s ease';
                    div.style.opacity = '0';
                    setTimeout(() => renderTasks(allTasks), 300); // Ricarica list pulita
                } catch(e) {
                    console.error(e);
                    text.classList.replace('text-cyan-700', 'text-cyan-100');
                    text.classList.remove('line-through');
                    div.style.pointerEvents = 'auto';
                }
            });
        }

        listEl.appendChild(div);
    });
}
