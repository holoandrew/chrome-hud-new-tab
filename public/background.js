// Configura un alarm ogni 60 minuti
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('checkGoogleTasks', { periodInMinutes: 60 });
});

// Ascolta l'alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkGoogleTasks') {
        checkTasksDueToday();
    }
});

async function checkTasksDueToday() {
    try {
        // Cerca di ottenere il token in modo silenzioso (senza interazione utente)
        const token = await new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: false }, (token) => {
                if (chrome.runtime.lastError || !token) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(token);
                }
            });
        });

        // Ottieni la lista delle liste
        const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const listsData = await listsRes.json();
        if (!listsData.items || listsData.items.length === 0) return;

        const defaultListId = listsData.items[0].id;

        // Recupera i task della prima lista
        const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${defaultListId}/tasks?showCompleted=false`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const tasksData = await tasksRes.json();
        
        if (!tasksData.items) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Trova i task che scadono oggi e non sono completati
        const dueToday = tasksData.items.filter(task => {
            if (task.status === 'completed') return false;
            if (!task.due) return false;
            
            const dueDate = new Date(task.due);
            dueDate.setHours(0, 0, 0, 0);
            
            return dueDate.getTime() === today.getTime();
        });

        if (dueToday.length > 0) {
            // Prepara una stringa con i titoli (massimo 3 per leggibilità)
            const taskTitles = dueToday.slice(0, 3).map(t => "• " + t.title).join("\n");
            let message = taskTitles;
            if (dueToday.length > 3) {
                message += `\n...e altri ${dueToday.length - 3} task.`;
            }

            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon.png',
                title: `Hai ${dueToday.length} task in scadenza oggi!`,
                message: message,
                priority: 2
            });
        }

    } catch (e) {
        console.warn("Tasks sync in background fallita o utente non loggato:", e);
    }
}
